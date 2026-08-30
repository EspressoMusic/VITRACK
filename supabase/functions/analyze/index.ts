// Deploy with: supabase functions deploy analyze
// Ported from backend/src/analyzeFood.js + backend/src/server.js so the
// same OpenAI vision analysis can run as a Supabase Edge Function instead
// of a separately-hosted Express server. This is a paid feature (see
// PaywallPanel), so every call must carry a signed-in Supabase session
// belonging to an account with an active Paddle subscription — see
// requireActiveSubscription in ../_shared/subscription.ts. Also kept
// behind a per-IP rate limit (see checkRateLimit) as defense in depth.
// Calls the OpenAI REST API directly via fetch rather than the `openai`
// npm package, which does not reliably attach the Authorization header
// under the Deno edge runtime.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { requireActiveSubscription } from '../_shared/subscription.ts'
import { getClientIp } from '../_shared/clientIp.ts'
import { fetchOpenAI } from '../_shared/openaiRetry.ts'

// Keep in sync with frontend/src/lib/nutrients.ts and backend/src/nutrients.js.
const NUTRIENT_IDS = [
  'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK',
  'vitaminB1', 'vitaminB2', 'vitaminB3', 'vitaminB5', 'vitaminB6', 'vitaminB7', 'vitaminB9', 'vitaminB12',
  'calcium', 'iron', 'magnesium', 'zinc', 'potassium', 'phosphorus', 'copper', 'manganese', 'selenium', 'iodine',
]

const NUTRIENT_UNITS: Record<string, string> = {
  vitaminA: 'mcg', vitaminC: 'mg', vitaminD: 'mcg', vitaminE: 'mg', vitaminK: 'mcg',
  vitaminB1: 'mg', vitaminB2: 'mg', vitaminB3: 'mg', vitaminB5: 'mg', vitaminB6: 'mg', vitaminB7: 'mcg', vitaminB9: 'mcg', vitaminB12: 'mcg',
  calcium: 'mg', iron: 'mg', magnesium: 'mg', zinc: 'mg', potassium: 'mg',
  phosphorus: 'mg', copper: 'mg', manganese: 'mg', selenium: 'mcg', iodine: 'mcg',
}

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o'

const nutrientProperties = Object.fromEntries(
  NUTRIENT_IDS.map((id) => [
    id,
    {
      type: 'number',
      description: `Estimated total ${id} in ${NUTRIENT_UNITS[id]} provided by the meal in the photo.`,
    },
  ])
)

const MACRO_IDS = ['calories', 'carbsG', 'fatG', 'proteinG']

const MACRO_PROPERTIES = {
  calories: { type: 'number', description: 'Estimated total calories (kcal) provided by the meal.' },
  carbsG: { type: 'number', description: 'Estimated total carbohydrates in grams provided by the meal.' },
  fatG: { type: 'number', description: 'Estimated total fat in grams provided by the meal.' },
  proteinG: { type: 'number', description: 'Estimated total protein in grams provided by the meal.' },
}

const REPORT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'report_nutrition',
    description:
      'Report the foods identified in the photo and the estimated vitamin/mineral content of the whole meal shown.',
    parameters: {
      type: 'object',
      properties: {
        foods: {
          type: 'array',
          description: 'Each distinct food item visible in the photo.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Short name of the food item, e.g. "Grilled chicken breast".' },
              portion: { type: 'string', description: 'Estimated portion size, e.g. "~150g" or "1 medium bowl".' },
            },
            required: ['name', 'portion'],
          },
        },
        nutrients: {
          type: 'object',
          description: 'Estimated TOTAL nutrient content of the entire meal (all foods combined).',
          properties: nutrientProperties,
          required: NUTRIENT_IDS,
        },
        macros: {
          type: 'object',
          description: 'Estimated TOTAL calories and macronutrient (carbs/fat/protein) content of the entire meal.',
          properties: MACRO_PROPERTIES,
          required: MACRO_IDS,
        },
        confidence: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Your confidence in this estimate given photo clarity and how easy the foods/portions were to judge.',
        },
        isJunkFood: {
          type: 'boolean',
          description:
            'True if this is primarily an ultra-processed, fried, sugary, or refined-flour food with little nutritional ' +
            'value on its own (pastries, candy, soda, chips, fast food, deep-fried items, etc). False for whole or ' +
            'minimally-processed foods (fruits, vegetables, grains, proteins, dairy) even if eaten as part of a treat-ish meal.',
        },
        note: {
          type: 'string',
          description: 'One short, friendly sentence noting any major assumptions made about hidden ingredients or portion size.',
        },
      },
      required: ['foods', 'nutrients', 'macros', 'confidence', 'isJunkFood'],
    },
  },
}

const SYSTEM_PROMPT = `You are a careful nutrition-estimation assistant inside a personal diet-tracking app.
A user uploads a photo of a meal. Identify each distinct food item and its approximate portion size,
then estimate the TOTAL calories, macronutrients (carbs/fat/protein), and vitamin/mineral content of the
whole meal using standard nutrition-database knowledge (e.g. USDA FoodData Central figures) for those
portions. Always call the report_nutrition tool with your best numeric estimate for every field, even if
approximate — never leave a nutrient, macro, or calorie value blank or zero unless the food genuinely
contains none of it. Be realistic: a single meal rarely supplies 100% of any nutrient's daily allowance.
Also set isJunkFood honestly — true for ultra-processed/fried/sugary/refined items, false for whole or
minimally-processed foods. If the image does not show food at all, still call the tool with an empty foods
array, all nutrients and macros at 0, confidence "low", and a note explaining that no food was recognized.`

const TEXT_SYSTEM_PROMPT = `You are a careful nutrition-estimation assistant inside a personal diet-tracking app.
A user manually logs a food they ate by typing its name and the quantity they consumed, with no photo.
Estimate the TOTAL calories, macronutrients (carbs/fat/protein), and vitamin/mineral content of that food
and quantity using standard nutrition-database knowledge (e.g. USDA FoodData Central figures). Always call
the report_nutrition tool with your best numeric estimate for every field, even if approximate — never leave
a nutrient, macro, or calorie value blank or zero unless the food genuinely contains none of it. Also set
isJunkFood honestly — true for ultra-processed/fried/sugary/refined items, false for whole or
minimally-processed foods. Report exactly one entry in the foods array, using the given name and quantity as
its portion.`

// The model occasionally returns a plain text reply instead of the requested tool call
// (transient, not tied to any particular input) — one retry clears it almost every time.
async function requestNutritionReport(messages: unknown[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.split(/\s/)[0]?.replace(/^['"]|['"]$/g, '')

  for (let attempt = 0; attempt < 2; attempt++) {
    const openaiRes = await fetchOpenAI('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages,
        tools: [REPORT_TOOL],
        tool_choice: { type: 'function', function: { name: 'report_nutrition' } },
      }),
    })

    const response = await openaiRes.json()
    if (!openaiRes.ok) {
      throw Object.assign(new Error(response.error?.message || 'OpenAI request failed.'), { status: openaiRes.status })
    }

    const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
    if (toolCall) return toolCall
  }

  throw Object.assign(new Error('The model did not return a structured nutrition estimate.'), { status: 502 })
}

async function analyzeFoodText(foodName: string, quantity: string) {
  if (typeof foodName !== 'string' || !foodName.trim()) {
    throw Object.assign(new Error('Food name is required.'), { status: 400 })
  }

  const toolCall = await requestNutritionReport([
    { role: 'system', content: TEXT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Food: ${foodName.trim()}\nQuantity: ${quantity?.trim() || 'a typical serving'}`,
    },
  ])

  const { foods = [], nutrients = {}, macros = {}, confidence = 'low', isJunkFood = false, note } = JSON.parse(toolCall.function.arguments)

  const normalizedNutrients = Object.fromEntries(
    NUTRIENT_IDS.map((id) => [id, Math.max(0, Number(nutrients[id]) || 0)])
  )
  const normalizedMacros = Object.fromEntries(
    MACRO_IDS.map((id) => [id, Math.max(0, Number(macros[id]) || 0)])
  )

  return { foods, nutrients: normalizedNutrients, macros: normalizedMacros, confidence, isJunkFood, note }
}

async function analyzeFoodImage(imageDataUrl: string) {
  if (!/^data:image\/(?:jpeg|png|webp|gif);base64,.+/.test(imageDataUrl)) {
    throw Object.assign(new Error('Image must be a base64 data URL (jpeg, png, webp, or gif).'), { status: 400 })
  }

  const toolCall = await requestNutritionReport([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this meal photo and report the foods and their estimated vitamin/mineral content.' },
        { type: 'image_url', image_url: { url: imageDataUrl } },
      ],
    },
  ])

  const { foods = [], nutrients = {}, macros = {}, confidence = 'low', isJunkFood = false, note } = JSON.parse(toolCall.function.arguments)

  const normalizedNutrients = Object.fromEntries(
    NUTRIENT_IDS.map((id) => [id, Math.max(0, Number(nutrients[id]) || 0)])
  )
  const normalizedMacros = Object.fromEntries(
    MACRO_IDS.map((id) => [id, Math.max(0, Number(macros[id]) || 0)])
  )

  return { foods, nutrients: normalizedNutrients, macros: normalizedMacros, confidence, isJunkFood, note }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Extra defense in depth on top of the subscription check above — also rate-limited per
// caller IP, since a compromised/shared token shouldn't be able to run up unbounded spend.
const RATE_LIMIT_MAX_REQUESTS = 30
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60

async function isRateLimited(req: Request): Promise<boolean> {
  const clientIp = getClientIp(req)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: allowed, error } = await admin.rpc('check_rate_limit', {
    p_client_key: `analyze:${clientIp}`,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  })
  if (error) {
    // Fail open: a broken rate-limit check must never take down meal logging for everyone.
    console.error('Rate limit check failed:', error)
    return false
  }
  return !allowed
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

  let body: { image?: string; foodName?: string; quantity?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const hasImage = typeof body.image === 'string' && body.image.startsWith('data:image/')
  const hasFoodName = typeof body.foodName === 'string' && body.foodName.trim().length > 0
  if (!hasImage && !hasFoodName) {
    return new Response(JSON.stringify({ error: 'Request body must include an "image" data URL or a "foodName".' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = hasImage
      ? await analyzeFoodImage(body.image as string)
      : await analyzeFoodText(body.foodName as string, body.quantity ?? '')
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as { status?: number; message?: string }
    console.error('Analysis failed:', err)
    return new Response(JSON.stringify({ error: error.message || 'Analysis failed.' }), {
      status: error.status || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
