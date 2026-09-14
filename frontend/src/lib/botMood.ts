import { getAllWorkouts, getMealsByDate } from './db'
import { getWeekDateKeys, todayKey } from './date'

export interface BotMoodStatus {
  /** Name of the most recently logged junk-food meal today, if any. */
  junkFoodName: string | null
  /** Name of the active weekly challenge (this week's un-archived goal), if any. */
  challengeName: string | null
  /** Active challenge exists and junk food was logged today — the challenge is being broken. */
  challengeBroken: boolean
  /** Active challenge exists, today is marked done, and no junk food was logged today. */
  challengeOnTrack: boolean
}

/** Reads today's food log and this week's active challenge to decide whether the bot has
 *  something to be angry about — logged junk food, or a challenge slipping. Read fresh each
 *  time ChatPanel mounts (i.e. whenever the user opens the chat tab). */
export async function getTodaysBotMood(): Promise<BotMoodStatus> {
  const today = todayKey()
  const weekDates = getWeekDateKeys(today)
  const [todaysMeals, workouts] = await Promise.all([getMealsByDate(today), getAllWorkouts()])

  const junkMeal = [...todaysMeals].reverse().find((m) => m.isJunkFood)
  const activeChallengeEntries = workouts.filter((w) => !w.archived && weekDates.includes(w.date))
  const challengeName = activeChallengeEntries[0]?.name ?? null
  const todayEntry = activeChallengeEntries.find((w) => w.date === today)

  return {
    junkFoodName: junkMeal?.foods[0]?.name ?? null,
    challengeName,
    challengeBroken: !!challengeName && !!junkMeal,
    challengeOnTrack: !!challengeName && !!todayEntry?.done && !junkMeal,
  }
}
