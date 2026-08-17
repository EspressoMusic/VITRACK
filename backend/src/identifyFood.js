import OpenAI from 'openai'

// Lightweight companion to analyzeFood.js. This one ONLY answers "what food is this?" from a
// single camera frame — it does not estimate nutrients. Once the user confirms, the frontend
// calls analyzeFoodText (existing nutrition path) for the actual vitamin/mineral estimate.
const MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'

const IDENTIFY_TOOL = {
  type: 'function',
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

export async function identifyFood(imageDataUrl) {
  if (!/^data:image\/(?:jpeg|png|webp|gif);base64,.+/.test(imageDataUrl)) {
    throw Object.assign(new Error('Image must be a base64 data URL (jpeg, png, webp, or gif).'), { status: 400 })
  }

  const client = new OpenAI()
  const response = await client.chat.completions.create({
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
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall) {
    throw Object.assign(new Error('The model did not return a structured identification.'), { status: 502 })
  }

  let parsed
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
      ? parsed.alternatives.filter((a) => typeof a === 'string' && a.trim()).slice(0, 5)
      : [],
  }
}
