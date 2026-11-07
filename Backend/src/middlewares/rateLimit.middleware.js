const { rateLimit } = require("express-rate-limit")
const config = require("../config/env")

/*
 * Every AI call costs money, and login is a target for password guessing, so these routes
 * are rate limited. Counts live in memory: they reset when the server restarts and are not
 * shared between several server processes. Use a shared store (e.g. Redis) if you run more than one.
 */

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

function limiter({ windowMs, limit, message, keyGenerator, skipSuccessfulRequests = false }) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        skipSuccessfulRequests,
        message: { message },
        ...(keyGenerator ? { keyGenerator } : {})
    })
}

/**
 * Failed logins, counted per IP and email together: slows down password guessing on an
 * account without one person's typos locking out everyone else on the same network.
 * Successful logins don't count.
 */
const loginAttempts = limiter({
    windowMs: 15 * MINUTE,
    limit: config.loginFailuresPer15Min,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => `${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`,
    message: "Too many failed login attempts. Please wait 15 minutes and try again."
})

/** New accounts per IP, so nobody can create accounts in bulk to get around the per-user AI limit. */
const registerPerIp = limiter({
    windowMs: HOUR,
    limit: config.registerPerIpPerHour,
    message: "Too many accounts created from this network. Please try again in an hour."
})

/** Logged-in users generating reports and resume PDFs. */
const generatePerUser = limiter({
    windowMs: HOUR,
    limit: config.generatePerUserPerHour,
    keyGenerator: (req) => String(req.user.id),
    message: "You've generated a lot in the last hour. Please wait a little before trying again."
})

module.exports = { loginAttempts, registerPerIp, generatePerUser }
