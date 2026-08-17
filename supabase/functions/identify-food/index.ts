// Deploy with: supabase functions deploy identify-food
// Lightweight companion to the `analyze` function. This one ONLY answers "what food is this?"
// from a single camera frame — it does not estimate nutrients. Once the user confirms the
// identified food, the frontend calls the existing analyzeFoodText path (the `analyze` function)
// to get the actual vitamin/mineral estimate, so OpenAI Vision here is purely an ID step.
// Calls the OpenAI REST API directly via fetch, matching supabase/functions/analyze/index.ts.

const MODEL = Deno.env.get('OPENAI_VISION_MODEL') || 'gpt-4o-mini'

const IDENTIFY_TOOL = {
  type: 'function' as const,
  function: {
    name: 'report_food_identification',
    description: 'Report the single most prominent food item visible in the photo.',
    parameters: {
      type: 'object',
      properties: {
        food: {
          type: 'string',
          description: 'Lowercase canonical food name, e.g. "banana". Empty string if no food is visible.',
        },
        displayName: {
          type: 'string',
          description: 'Human-readable capitalized name, e.g. "Banana". Empty string if no food is visible.',
        },
        emoji: {
          type: 'string',
          description: 'Single emoji best representing this food, e.g. "🍌". Use "❓" if no food is visible.',
        },
        confidence: {
          type: 'number',
          description: 'Confidence from 0 to 1 that this identification is correct. 0 if no food is visible.',
        },
        alternatives: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Other plausible names for this same item, most likely first, lowercase. Empty array if none or if no food is visible.',
        },
      },
      required: ['food', 'displayName', 'emoji', 'confidence', 'alternatives'],
    },
  },
}

const SYSTEM_PROMPT = `You are a food identification assistant inside a camera-based diet-tracking app.
You are shown a single photo captured from a live camera feed. Identify the single most prominent food
item in the photo and report it using the report_food_identification tool.

The photo may show a real physical food item, or a food photo displayed on a screen (phone, tablet,
computer monitor) or a printed picture — treat both the same way and identify the food shown, not the
display device.

If multiple foods are visible, report the largest/most prominent one as "food"/"displayName", and list
any other clearly visible distinct foods, lowercase, in "alternatives".

If you cannot identify any food in the photo at all, set "food" and "displayName" to empty strings,
"emoji" to "❓", "confidence" to 0, and "alternatives" to an empty array. Otherwise always give your best
guess even if the view is partial or blurry, and reflect any uncertainty in the confidence score rather
than refusing to answer.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IdentifyResult {
  food: string
  displayName: string
  emoji: string
  confidence: number
  alternatives: string[]
}

async function identifyFood(imageDataUrl: string): Promise<IdentifyResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.split(/\s/)[0]?.replace(/^['"]|['"]$/g, '')
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What food is shown in this photo?' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      tools: [IDENTIFY_TOOL],
      tool_choice: { type: 'function', function: { name: 'report_food_identification' } },
    }),
  })

  const response = await openaiRes.json()
  if (!openaiRes.ok) {
    throw Object.assign(new Error(response.error?.message || 'OpenAI request failed.'), { status: openaiRes.status })
  }

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
  if (!toolCall) {
    throw Object.assign(new Error('The model did not return a structured identification.'), { status: 502 })
  }

  let parsed: { food?: string; displayName?: string; emoji?: string; confidence?: number; alternatives?: string[] }
  try {
    parsed = JSON.parse(toolCall.function.arguments)
  } catch {
    throw Object.assign(new Error('The model returned invalid JSON.'), { status: 502 })
  }

  return {
    food: typeof parsed.food === 'string' ? parsed.food.trim().toLowerCase() : '',
    displayName: typeof parsed.displayName === 'string' ? parsed.displayName.trim() : '',
    emoji: typeof parsed.emoji === 'string' && parsed.emoji ? parsed.emoji : '🍽️',
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
    alternatives: Array.isArray(parsed.alternatives)
      ? parsed.alternatives.filter((a): a is string => typeof a === 'string' && a.trim().length > 0).slice(0, 5)
      : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!Deno.env.get('OPENAI_API_KEY')) {
    return new Response(
      JSON.stringify({ error: 'Server is missing OPENAI_API_KEY. Set it with: supabase secrets set OPENAI_API_KEY=sk-...' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: { image?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (typeof body.image !== 'string' || !body.image.startsWith('data:image/')) {
    return new Response(JSON.stringify({ error: 'Request body must include an "image" data URL.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await identifyFood(body.image)
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as { status?: number; message?: string }
    console.error('Food identification failed:', err)
    return new Response(JSON.stringify({ error: error.message || 'Food identification failed.' }), {
      status: error.status || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
