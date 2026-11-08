const { test } = require("node:test")
const assert = require("node:assert/strict")
const { withRetry } = require("../src/utils/retry")

const apiError = (status) => Object.assign(new Error(`status ${status}`), { status })
const noWait = { delaysMs: [ 0, 0 ] }

test("a busy provider (503) is retried until it answers", async () => {
    let calls = 0
    const result = await withRetry(async () => {
        calls++
        if (calls < 3) throw apiError(503)
        return "ok"
    }, noWait)

    assert.equal(result, "ok")
    assert.equal(calls, 3)
})

test("rate limits (429) are retried too", async () => {
    let calls = 0
    const result = await withRetry(async () => {
        if (++calls === 1) throw apiError(429)
        return "ok"
    }, noWait)

    assert.equal(result, "ok")
    assert.equal(calls, 2)
})

test("gives up after the last retry and throws the provider's error", async () => {
    let calls = 0
    await assert.rejects(
        withRetry(async () => { calls++; throw apiError(503) }, noWait),
        { status: 503 }
    )
    assert.equal(calls, 3)
})

test("errors that won't fix themselves (like a bad API key) are not retried", async () => {
    let calls = 0
    await assert.rejects(
        withRetry(async () => { calls++; throw apiError(400) }, noWait),
        { status: 400 }
    )
    assert.equal(calls, 1)
})

test("reports each retry so it shows up in the server logs", async () => {
    const retries = []
    let calls = 0
    await withRetry(async () => {
        if (++calls < 3) throw apiError(503)
        return "ok"
    }, { ...noWait, onRetry: (err, attempt) => retries.push([ err.status, attempt ]) })

    assert.deepEqual(retries, [ [ 503, 1 ], [ 503, 2 ] ])
})
