import OpenAI from 'openai'
import { NUTRIENT_IDS, NUTRIENT_UNITS } from './nutrients.js'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

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
  type: 'function',
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

const client = new OpenAI()

// The model occasionally returns a plain text reply instead of the requested tool call
// (transient, not tied to any particular input) — one retry clears it almost every time.
async function requestNutritionReport(messages) {
  let lastResponse
  for (let attempt = 0; attempt < 2; attempt++) {
    lastResponse = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages,
      tools: [REPORT_TOOL],
      tool_choice: { type: 'function', function: { name: 'report_nutrition' } },
    })
    const toolCall = lastResponse.choices[0]?.message?.tool_calls?.[0]
    if (toolCall) return toolCall
  }
  throw Object.assign(new Error('The model did not return a structured nutrition estimate.'), { status: 502 })
}

export async function analyzeFoodText(foodName, quantity) {
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

export async function analyzeFoodImage(imageDataUrl) {
  if (!/^data:image\/(?:jpeg|png|webp|gif);base64,.+/.test(imageDataUrl)) {
    throw Object.assign(new Error('Image must be a base64 data URL (jpeg, png, webp, or gif).'), {
      status: 400,
    })
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
