// Shared by analyzeFood.js/identifyFood.js/nutritionChat.js. A single network blip or a
// transient 5xx/429 from OpenAI's own infrastructure currently fails the user's request
// outright with no retry — this is the main source of "Request failed" errors reported from
// the app. Retrying once with a short backoff clears most of these without meaningfully
// slowing down the happy path.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 2
const BASE_DELAY_MS = 500

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Runs `fn` (an OpenAI SDK call), retrying once on a network error or a retryable HTTP
 *  status before giving up. Non-retryable failures (4xx other than 429) are rethrown
 *  immediately since a retry can't fix a bad request. */
export async function withOpenAIRetry(fn) {
  let lastError
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1
      const isRetryable = err?.status === undefined || RETRYABLE_STATUS.has(err.status)
      if (!isRetryable || isLastAttempt) throw err
      lastError = err
      await sleep(BASE_DELAY_MS * 2 ** attempt)
    }
  }
  throw lastError
}
