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

function systemPrompt(lang, mode) {
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

export async function askNutritionBot(history, lang, mode = 'nutrition') {
  const client = new OpenAI()
  const response = await withOpenAIRetry(() =>
    client.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'system', content: systemPrompt(lang, mode) }, ...history],
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
