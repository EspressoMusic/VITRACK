import type { BotMoodStatus } from './botMood'

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Resolves one random angry rant line for the given mood — the same template pool ChatPanel
 *  uses when the user taps the angry bot icon, reused here so the heads-up toast can show the
 *  same kind of line without duplicating the pick+substitute logic. */
export function pickBotRant(mood: BotMoodStatus, strings: { angryRantFood: string[]; angryRantChallenge: string[] }): string {
  const template = mood.junkFoodName ? pickRandom(strings.angryRantFood) : pickRandom(strings.angryRantChallenge)
  return template.replace('{food}', mood.junkFoodName ?? '').replace('{challenge}', mood.challengeName ?? '')
}
