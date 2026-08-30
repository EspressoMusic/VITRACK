import OpenAI from 'openai'
import { withOpenAIRetry } from './openaiRetry.js'

// General nutrition Q&A companion to analyzeFood.js / identifyFood.js. Given the running
// conversation, answers the user's question and optionally proposes a handful of specific
// foods, which the frontend renders as tappable cards in the chat.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const LANGUAGE_NAMES = { en: 'English', he: 'Hebrew', ar: 'Arabic' }

const CHAT_TOOL = {
  type: 'function',
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

function systemPrompt(lang) {
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

export async function askNutritionBot(history, lang) {
  const client = new OpenAI()
  const response = await withOpenAIRetry(() =>
    client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt(lang) }, ...history],
      tools: [CHAT_TOOL],
      tool_choice: { type: 'function', function: { name: 'report_nutrition_chat_reply' } },
    })
  )

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall) {
    throw Object.assign(new Error('The model did not return a structured reply.'), { status: 502 })
  }

  let parsed
  try {
    parsed = JSON.parse(toolCall.function.arguments)
  } catch {
    throw Object.assign(new Error('The model returned invalid JSON.'), { status: 502 })
  }

  return {
    reply: typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : '...',
    foods: Array.isArray(parsed.foods)
      ? parsed.foods
          .filter((f) => typeof f?.name === 'string' && f.name.trim())
          .slice(0, 4)
          .map((f) => ({
            name: f.name.trim(),
            emoji: typeof f.emoji === 'string' && f.emoji ? f.emoji : '🍽️',
            tip: typeof f.tip === 'string' ? f.tip.trim() : '',
          }))
      : [],
  }
}
