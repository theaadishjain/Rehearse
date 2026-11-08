/**
 * HTTP statuses that usually mean "busy, try again shortly" rather than a real problem with
 * the request: rate limited (429) or the provider overloaded / briefly down (5xx).
 * Gemini returns 503 "This model is currently experiencing high demand" during demand spikes.
 */
const RETRYABLE_STATUSES = new Set([ 429, 500, 502, 503, 504 ])

function isRetryable(err) {
    return RETRYABLE_STATUSES.has(err?.status)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Runs fn, and if it fails with a retryable error, waits and tries again once per entry in
 * delaysMs. Any other error, or the last retryable one, is thrown as is.
 *
 * A little random jitter is added to each wait so that several requests that failed at the
 * same moment don't all hit the provider again at the same moment.
 */
async function withRetry(fn, { delaysMs = [ 2000, 5000 ], onRetry } = {}) {
    for (let attempt = 0; ; attempt++) {
        try {
            return await fn()
        } catch (err) {
            if (attempt >= delaysMs.length || !isRetryable(err)) throw err
            const wait = delaysMs[ attempt ] + Math.floor(Math.random() * 500)
            onRetry?.(err, attempt + 1, wait)
            await sleep(wait)
        }
    }
}

module.exports = { withRetry, isRetryable }
