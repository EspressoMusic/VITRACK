// Deploy with: supabase functions deploy analyze
// Ported from backend/src/analyzeFood.js + backend/src/server.js so the
// same OpenAI vision analysis can run as a Supabase Edge Function instead
// of a separately-hosted Express server. No auth required, matching the
// app's guest/local-only mode (see README).
// Calls the OpenAI REST API directly via fetch rather than the `openai`
// npm package, which does not reliably attach the Authorization header
// under the Deno edge runtime.

const NUTRIENT_IDS = [
  'vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK',
  'vitaminB1', 'vitaminB2', 'vitaminB3', 'vitaminB6', 'vitaminB9', 'vitaminB12',
  'calcium', 'iron', 'magnesium', 'zinc', 'potassium',
]

const NUTRIENT_UNITS: Record<string, string> = {
  vitaminA: 'mcg', vitaminC: 'mg', vitaminD: 'mcg', vitaminE: 'mg', vitaminK: 'mcg',
  vitaminB1: 'mg', vitaminB2: 'mg', vitaminB3: 'mg', vitaminB6: 'mg', vitaminB9: 'mcg', vitaminB12: 'mcg',
  calcium: 'mg', iron: 'mg', magnesium: 'mg', zinc: 'mg', potassium: 'mg',
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
        confidence: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Your confidence in this estimate given photo clarity and how easy the foods/portions were to judge.',
        },
        note: {
          type: 'string',
          description: 'One short, friendly sentence noting any major assumptions made about hidden ingredients or portion size.',
        },
      },
      required: ['foods', 'nutrients', 'confidence'],
    },
  },
}

const SYSTEM_PROMPT = `You are a careful nutrition-estimation assistant inside a personal diet-tracking app.
A user uploads a photo of a meal. Identify each distinct food item and its approximate portion size,
then estimate the TOTAL vitamin and mineral content of the whole meal using standard nutrition-database
knowledge (e.g. USDA FoodData Central figures) for those portions. Always call the report_nutrition tool
with your best numeric estimate for every field, even if approximate — never leave a nutrient blank or zero
unless the food genuinely contains none of it. Be realistic: a single meal rarely supplies 100% of any
nutrient's daily allowance. If the image does not show food at all, still call the tool with an empty
foods array, all nutrients at 0, confidence "low", and a note explaining that no food was recognized.`

const TEXT_SYSTEM_PROMPT = `You are a careful nutrition-estimation assistant inside a personal diet-tracking app.
A user manually logs a food they ate by typing its name and the quantity they consumed, with no photo.
Estimate the TOTAL vitamin and mineral content of that food and quantity using standard nutrition-database
knowledge (e.g. USDA FoodData Central figures). Always call the report_nutrition tool with your best numeric
estimate for every field, even if approximate — never leave a nutrient blank or zero unless the food genuinely
contains none of it. Report exactly one entry in the foods array, using the given name and quantity as its portion.`

// The model occasionally returns a plain text reply instead of the requested tool call
// (transient, not tied to any particular input) — one retry clears it almost every time.
async function requestNutritionReport(messages: unknown[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.split(/\s/)[0]?.replace(/^['"]|['"]$/g, '')

  for (let attempt = 0; attempt < 2; attempt++) {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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

  const { foods = [], nutrients = {}, confidence = 'low', note } = JSON.parse(toolCall.function.arguments)

  const normalizedNutrients = Object.fromEntries(
    NUTRIENT_IDS.map((id) => [id, Math.max(0, Number(nutrients[id]) || 0)])
  )

  return { foods, nutrients: normalizedNutrients, confidence, note }
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

  const { foods = [], nutrients = {}, confidence = 'low', note } = JSON.parse(toolCall.function.arguments)

  const normalizedNutrients = Object.fromEntries(
    NUTRIENT_IDS.map((id) => [id, Math.max(0, Number(nutrients[id]) || 0)])
  )

  return { foods, nutrients: normalizedNutrients, confidence, note }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
