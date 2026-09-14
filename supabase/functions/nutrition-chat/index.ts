// Deploy with: supabase functions deploy nutrition-chat
// General nutrition Q&A chat behind the Superfoods tab. Given the running conversation, answers
// the user's question in their app language and optionally proposes a handful of specific foods,
// or full meal ideas with a macro breakdown, as tappable cards. Part of the same paid AI feature
// set as analyze/identify-food, so it's gated by the same subscription check (see
// ../_shared/subscription.ts) plus a per-IP rate limit.
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
        reply: { type: 'string', description: 'A short, human, conversational answer or clarifying question (1 sentence, plain casual language, no corporate phrasing).' },
        options: {
          type: 'array',
          description:
            'Up to 4 short tappable choice labels (1-3 words each, e.g. "Breakfast", "Lunch", "Dinner", "Snack" — translate these into the reply language, never leave them in English) to offer when "reply" is a clarifying question you need answered before giving a real answer — lets the user tap instead of typing. Empty array whenever "reply" is already a direct answer, or whenever "foods"/"meals" is used instead.',
          items: { type: 'string' },
        },
        foods: {
          type: 'array',
          description:
            'Up to 4 specific single foods that fit the conversation, most relevant first. Empty array if none fit, ' +
            'or if "meals" is used instead — in particular, always empty whenever the question is about a specific ' +
            'meal of the day (breakfast/lunch/dinner/snack), since that always uses "meals" instead.',
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
        meals: {
          type: 'array',
          description:
            'Up to 3 full meal ideas when the user asks for a whole meal rather than a single food — e.g. a good dinner for bulking/mass gain, a good dinner for weight loss, a high-protein lunch, etc. Empty array if none fit, or if "foods" is used instead.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Short meal name in the reply language, e.g. "Grilled chicken, rice & broccoli".' },
              emoji: { type: 'string', description: 'Single emoji best representing this meal.' },
              tip: { type: 'string', description: 'One short clause on why this meal fits their goal, e.g. "high protein to support muscle growth".' },
              calories: { type: 'number', description: 'Realistic estimated total calories for this meal.' },
              proteinG: { type: 'number', description: 'Estimated grams of protein.' },
              carbsG: { type: 'number', description: 'Estimated grams of carbs.' },
              fatG: { type: 'number', description: 'Estimated grams of fat.' },
              recipe: {
                type: 'object',
                description: 'A simple recipe for this exact meal — a short ingredient list and a few easy, beginner-friendly prep steps.',
                properties: {
                  ingredients: {
                    type: 'array',
                    description: 'Short ingredient list with rough quantities, in the reply language including the unit (e.g. "200g chicken breast" in English, but "200 גרם חזה עוף" in Hebrew — never leave the unit in Latin letters when answering in another language).',
                    items: { type: 'string' },
                  },
                  steps: {
                    type: 'array',
                    description: 'Short, simple step-by-step prep instructions, easy for a beginner cook to follow.',
                    items: { type: 'string' },
                  },
                },
                required: ['ingredients', 'steps'],
              },
            },
            required: ['name', 'emoji', 'tip', 'calories', 'proteinG', 'carbsG', 'fatG', 'recipe'],
          },
        },
      },
      required: ['reply', 'options', 'foods', 'meals'],
    },
  },
}

function personalityTone(personality: string): string {
  switch (personality) {
    case 'veryNice':
      return ' Right now be extra warm and encouraging — sweeter and more supportive than usual, lots of gentle positivity, while keeping the same short length.'
    case 'angry':
      return ' Right now be short-tempered and blunt — noticeably less patient than usual, terser wording, a bit annoyed, though you still give the real answer/foods/meals asked for.'
    case 'superAngry':
      return (
        ' Right now be genuinely irritated and impatient, like the user is testing your patience — blunt, a little ' +
        'mocking, no soft phrasing, no cheerful wording, sound annoyed they are even asking. You must still give the ' +
        'real answer, foods, or meals they asked for — the attitude is in the delivery, not in refusing to help. ' +
        'Never insult who they are, never use slurs or profanity.'
      )
    default:
      return ''
  }
}

function systemPrompt(lang: string, mode: string, personality: string): string {
  const languageName = LANGUAGE_NAMES[lang] || 'English'
  if (mode === 'motivation') {
    return (
      `You are Jackie, a real, short-tempered workout coach texting inside a fitness-tracking app's ` +
      `"Motivation Corner" — you're a person fed up with excuses, not a scripted bot. Reply in ${languageName}, ` +
      `in 1 short, blunt, angry sentence (no more than 10 words). Your sentence must name or directly react to ` +
      `the specific thing they just said — their exact excuse, feeling, or word (tired, busy, sore, no time, ` +
      `whatever it is) — so it could only be a reply to that message, not a generic line that would fit any ` +
      `excuse. For example, if they say they're tired, your line must be about being tired specifically ` +
      `(e.g. mock the tiredness, tell them to push through it), not just a generic "stop complaining, go ` +
      `work out." Never fall back on a generic denial or brush-off that ignores what they actually wrote, ` +
      `and never repeat a phrase you've already used in this conversation. ` +
      `Write like a real person firing off a quick angry text: casual, natural, contractions, plain everyday ` +
      `words — no corporate tone, no cheering, no emoji, no soft phrasing. Sound genuinely irritated and ` +
      `impatient, like they're wasting your time by hesitating. Push them to act now. Never insult who they ` +
      `are, never use slurs or profanity — the anger is in tone and bluntness, not abuse. Never suggest foods; ` +
      `always return an empty "foods" array. Always call report_nutrition_chat_reply.`
    )
  }
  return (
    `You are a friendly nutrition assistant inside a diet-tracking app's "Superfoods" tab, texting like a ` +
    `real person, not a scripted bot. A user asks general nutrition questions — what's good for a symptom or ` +
    `goal, what a specific food is good for, what to eat for more energy, etc. Answer in ${languageName}, in ` +
    `1 short sentence (2 max) — plain, casual, human wording, no corporate filler like "feel free to ask" or ` +
    `"I'd be happy to help." Get straight to the point.` +
    personalityTone(personality) +
    ` ` +
    `If you need more info before you can answer well (which meal, which goal, which restriction, etc.), keep ` +
    `that question itself very short and put 2-4 short tappable choices in "options" (1-3 words each, e.g. ` +
    `"Breakfast" / "Lunch" / "Dinner" / "Snack", but written in ${languageName} — never leave "options" in ` +
    `English when answering in another language) instead of listing the choices inside the sentence, so they ` +
    `can tap instead of typing. When the choices are meal times, always offer all four — breakfast, lunch, ` +
    `dinner AND snack — never drop snack from the list. Only use "options" for that kind of clarifying ` +
    `question — leave it empty once you give a real answer, foods, or meals. ` +
    `If the latest message is just a short acknowledgment, decline, or farewell (e.g. "no thanks", "okay", ` +
    `"bye") rather than an actual nutrition question — including replying to something YOU said earlier in ` +
    `this history, like offering tips or a challenge — send back a short acknowledgment that still matches ` +
    `your current attitude from above (terse, unimpressed and a little annoyed if angry/superAngry, warm if ` +
    `veryNice, plain if normal) — never default to a cheerful "okay, good luck!" regardless of that attitude. ` +
    `Leave "options", "foods" and "meals" empty. Never reinterpret a plain acknowledgment as a new question, ` +
    `and never ask why they're not answering or not giving you something — they don't owe you an answer to ` +
    `something you asked. ` +
    `If the latest message is unclear, gibberish, or just a stray letter/word you genuinely can't parse as a ` +
    `question, don't fall back to a generic greeting or "how can I help you" line — ask what they mean in a ` +
    `short, natural, casual way, like a real person would. Never send the exact same reply twice in this ` +
    `conversation — check the history above and rephrase differently each time, even when the underlying point ` +
    `is the same (e.g. asking for clarification again should sound different from how you asked the first time). ` +
    `Leave "options", "foods" and "meals" empty for this case. ` +
    `Whenever they ask what to eat for a specific meal of the day — breakfast, lunch, dinner, or a snack, ` +
    `whether named directly or picked from your own "options" chips — this is a MEAL question, not a food ` +
    `question: you MUST use "meals" and leave "foods" empty. This applies even to a bare one-word reply like ` +
    `just "breakfast" — that alone always means "what should I eat for breakfast", never "suggest single ` +
    `breakfast foods". Answer with up to 3 full meal ideas in "meals", each a realistic combination that makes ` +
    `sense as that whole meal (e.g. for breakfast: "Eggs, toast & avocado", NOT single disconnected items like ` +
    `"Eggs" / "Yogurt" / "Oatmeal" each on their own), with a short concrete name, a short reason it fits their ` +
    `goal, and a realistic estimate of its total calories, protein, carbs and fat. Include a simple recipe too ` +
    `— a short ingredient list with rough quantities and a few short, easy prep steps anyone can follow. Use "foods" only when they ` +
    `ask for a single ingredient or food type with no meal-time attached (e.g. "what's a good source of ` +
    `protein"). ` +
    `Whenever they instead ask for a single food recommendation not tied to a specific meal (or the answer ` +
    `naturally calls for specific standalone foods, e.g. "what's good for energy" or "what fruit is highest ` +
    `in vitamin C"), suggest up to 4 specific whole foods in "foods", each with a short reason — these render ` +
    `as tappable cards, so keep names short and concrete (e.g. "Salmon", not "fatty fish in general"). ` +
    `The same goes for a full meal asked for by goal instead of time of day — e.g. a good dinner for ` +
    `bulking/mass gain, a good dinner for weight loss, a high-protein lunch, what to eat before/after a ` +
    `workout — use "meals" the same way. Only fill one of "foods" or "meals" per reply, whichever the ` +
    `question calls for, and leave the other empty. ` +
    `Whenever "foods" or "meals" is filled in, keep "reply" itself to one very short intro clause (e.g. "Here ` +
    `are a few ideas") — never restate the item names, reasons, calories, macros, or recipe steps as text in ` +
    `"reply", since the cards already show all of that; repeating it there just duplicates the same ` +
    `information twice. ` +
    `Do not give medical diagnoses, prescribe treatment or medication, or replace professional medical advice, ` +
    `and don't answer anything outside general nutrition/fitness. Whenever a question asks for exactly that — ` +
    `a diagnosis, a medication or dosage call, or any topic you're not allowed to advise on — say plainly and ` +
    `directly in "reply" that it's not something you can advise on (and for medical concerns, suggest they see ` +
    `a doctor) instead of trying to answer it anyway. Always call report_nutrition_chat_reply.`
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

interface ChatMealRecipe {
  ingredients: string[]
  steps: string[]
}

interface ChatMeal {
  name: string
  emoji: string
  tip: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  recipe: ChatMealRecipe
}

interface ChatReply {
  reply: string
  options: string[]
  foods: ChatFood[]
  meals: ChatMeal[]
}

async function askNutritionBot(history: ChatMessage[], lang: string, mode: string, personality: string): Promise<ChatReply> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.split(/\s/)[0]?.replace(/^['"]|['"]$/g, '')
  const openaiRes = await fetchOpenAI('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'system', content: systemPrompt(lang, mode, personality) }, ...history],
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

  let parsed: {
    reply?: string
    options?: string[]
    foods?: { name?: string; emoji?: string; tip?: string }[]
    meals?: {
      name?: string
      emoji?: string
      tip?: string
      calories?: number
      proteinG?: number
      carbsG?: number
      fatG?: number
      recipe?: { ingredients?: string[]; steps?: string[] }
    }[]
  }
  try {
    parsed = JSON.parse(toolCall.function.arguments)
  } catch {
    throw Object.assign(new Error('The model returned invalid JSON.'), { status: 502 })
  }

  const toNumber = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0)
  const toStringList = (arr: unknown): string[] =>
    Array.isArray(arr)
      ? arr
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 10)
      : []

  return {
    reply: typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : '...',
    options: Array.isArray(parsed.options)
      ? parsed.options
          .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
          .map((o) => o.trim())
          .slice(0, 4)
      : [],
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
    meals: Array.isArray(parsed.meals)
      ? parsed.meals
          .filter(
            (
              m
            ): m is {
              name: string
              emoji: string
              tip: string
              calories?: number
              proteinG?: number
              carbsG?: number
              fatG?: number
              recipe?: { ingredients?: string[]; steps?: string[] }
            } => typeof m?.name === 'string' && m.name.trim().length > 0
          )
          .slice(0, 3)
          .map((m) => ({
            name: m.name.trim(),
            emoji: typeof m.emoji === 'string' && m.emoji ? m.emoji : '🍽️',
            tip: typeof m.tip === 'string' ? m.tip.trim() : '',
            calories: toNumber(m.calories),
            proteinG: toNumber(m.proteinG),
            carbsG: toNumber(m.carbsG),
            fatG: toNumber(m.fatG),
            recipe: {
              ingredients: toStringList(m.recipe?.ingredients),
              steps: toStringList(m.recipe?.steps),
            },
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

  let body: { messages?: ChatMessage[]; lang?: string; mode?: string; personality?: string }
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
    const result = await askNutritionBot(history, body.lang || 'en', body.mode || 'nutrition', body.personality || 'normal')
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
