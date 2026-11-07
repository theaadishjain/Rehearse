const { rateLimit } = require("express-rate-limit")
const config = require("../config/env")

/*
 * Every AI call costs money, so the expensive routes are rate limited.
 * Counts live in memory: they reset when the server restarts and are not shared between
 * several server processes. Use a shared store (e.g. Redis) if you run more than one.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function limiter({ windowMs, limit, message, keyGenerator }) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { message },
        ...(keyGenerator ? { keyGenerator } : {})
    })
}

/** Visitors trying the public preview: a few tries per IP per hour. */
const previewPerIp = limiter({
    windowMs: HOUR,
    limit: config.previewPerIpPerHour,
    message: "You've tried the preview a few times. Create an account to keep going, or try again in an hour."
})

/** A ceiling on all public previews per day, so a flood of visitors can't run up the bill. */
const previewPerDay = limiter({
    windowMs: DAY,
    limit: config.previewPerDay,
    keyGenerator: () => "all-visitors",
    message: "The preview is very busy today. Create an account to make a full plan."
})

/** Logged-in users generating reports and resume PDFs. */
const generatePerUser = limiter({
    windowMs: HOUR,
    limit: config.generatePerUserPerHour,
    keyGenerator: (req) => String(req.user.id),
    message: "You've generated a lot in the last hour. Please wait a little before trying again."
})

module.exports = { previewPerIp, previewPerDay, generatePerUser }
