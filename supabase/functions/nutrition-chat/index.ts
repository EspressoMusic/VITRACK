// Deploy with: supabase functions deploy nutrition-chat
// General nutrition Q&A chat behind the Superfoods tab. Given the running conversation, answers
// the user's question in their app language and optionally proposes a handful of specific foods
// as tappable cards. Part of the same paid AI feature set as analyze/identify-food, so it's
// gated by the same subscription check (see ../_shared/subscription.ts) plus a per-IP rate limit.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { requireActiveSubscription } from '../_shared/subscription.ts'
import { getClientIp } from '../_shared/clientIp.ts'
import { fetchOpenAI } from '../_shared/openaiRetry.ts'

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', he: 'Hebrew', ar: 'Arabic' }

const CHAT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'report_nutrition_chat_reply',
    description: "Report a reply to the user's nutrition question, plus any specific foods worth suggesting.",
    parameters: {
      type: 'object',
      properties: {
        reply: { type: 'string', description: 'A short, friendly, conversational answer to the question (2-4 sentences max).' },
        foods: {
          type: 'array',
          description: 'Up to 4 specific foods that fit the conversation, most relevant first. Empty array if none fit.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Short food name in the reply language, e.g. "Salmon".' },
              emoji: { type: 'string', description: 'Single emoji best representing this food.' },
              tip: { type: 'string', description: 'One short clause on why this food helps, e.g. "rich in omega-3s".' },
            },
            required: ['name', 'emoji', 'tip'],
          },
        },
      },
      required: ['reply', 'foods'],
    },
  },
}

function systemPrompt(lang: string): string {
  const languageName = LANGUAGE_NAMES[lang] || 'English'
  return (
    `You are a friendly nutrition assistant inside a diet-tracking app's "Superfoods" tab. A user asks ` +
    `general nutrition questions — what's good for a symptom or goal, what a specific food is good for, ` +
    `what to eat for more energy, etc. Answer helpfully and conversationally in ${languageName}, in 2-4 short ` +
    `sentences. When relevant, suggest up to 4 specific whole foods that fit what they asked about, each with ` +
    `a short reason — these render as tappable cards, so keep names short and concrete (e.g. "Salmon", not ` +
    `"fatty fish in general"). Do not give medical diagnoses or replace professional medical advice; for ` +
    `medical concerns, gently suggest they see a doctor while still answering the general nutrition question. ` +
    `Always call report_nutrition_chat_reply.`
  )
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// A back-and-forth chat racks up more calls per session than a one-shot analysis, but each
// call is cheap text-only, so this sits between identify-food and analyze's limits.
const RATE_LIMIT_MAX_REQUESTS = 40
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60

async function isRateLimited(req: Request): Promise<boolean> {
  const clientIp = getClientIp(req)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: allowed, error } = await admin.rpc('check_rate_limit', {
    p_client_key: `nutrition-chat:${clientIp}`,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  })
  if (error) {
    console.error('Rate limit check failed:', error)
    return false
  }
  return !allowed
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatFood {
  name: string
  emoji: string
  tip: string
}

interface ChatReply {
  reply: string
  foods: ChatFood[]
}

async function askNutritionBot(history: ChatMessage[], lang: string): Promise<ChatReply> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.split(/\s/)[0]?.replace(/^['"]|['"]$/g, '')
  const openaiRes = await fetchOpenAI('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt(lang) }, ...history],
      tools: [CHAT_TOOL],
      tool_choice: { type: 'function', function: { name: 'report_nutrition_chat_reply' } },
    }),
  })

  const response = await openaiRes.json()
  if (!openaiRes.ok) {
    throw Object.assign(new Error(response.error?.message || 'OpenAI request failed.'), { status: openaiRes.status })
  }

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
  if (!toolCall) {
    throw Object.assign(new Error('The model did not return a structured reply.'), { status: 502 })
  }

  let parsed: { reply?: string; foods?: { name?: string; emoji?: string; tip?: string }[] }
  try {
    parsed = JSON.parse(toolCall.function.arguments)
  } catch {
    throw Object.assign(new Error('The model returned invalid JSON.'), { status: 502 })
  }

  return {
    reply: typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : '...',
    foods: Array.isArray(parsed.foods)
      ? parsed.foods
          .filter((f): f is { name: string; emoji: string; tip: string } => typeof f?.name === 'string' && f.name.trim().length > 0)
          .slice(0, 4)
          .map((f) => ({
            name: f.name.trim(),
            emoji: typeof f.emoji === 'string' && f.emoji ? f.emoji : '🍽️',
            tip: typeof f.tip === 'string' ? f.tip.trim() : '',
          }))
      : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const subCheck = await requireActiveSubscription(req)
  if (!subCheck.ok) {
    return new Response(JSON.stringify({ error: subCheck.error, code: 'subscription_required' }), {
      status: subCheck.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!Deno.env.get('OPENAI_API_KEY')) {
    return new Response(
      JSON.stringify({ error: 'Server is missing OPENAI_API_KEY. Set it with: supabase secrets set OPENAI_API_KEY=sk-...' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (await isRateLimited(req)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a bit.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: { messages?: ChatMessage[]; lang?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Request body must include a non-empty "messages" array.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const history = body.messages
    .filter((m): m is ChatMessage => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)

  try {
    const result = await askNutritionBot(history, body.lang || 'en')
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as { status?: number; message?: string }
    console.error('Nutrition chat failed:', err)
    return new Response(JSON.stringify({ error: error.message || 'Nutrition chat failed.' }), {
      status: error.status || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
