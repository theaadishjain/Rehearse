/**
 * Loads and validates configuration from environment variables once, at startup.
 * Fails fast with a readable message instead of crashing later deep inside a library.
 */

const REQUIRED = [ "MONGO_URI", "JWT_SECRET", "GOOGLE_GENAI_API_KEY" ]

function loadConfig(env = process.env) {
    const missing = REQUIRED.filter((key) => !env[ key ] || !env[ key ].trim())
    if (missing.length) {
        throw new Error(
            `Missing required environment variable(s): ${missing.join(", ")}. ` +
            "Copy Backend/.env.example to Backend/.env and fill them in."
        )
    }

    if (env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long.")
    }

    return Object.freeze({
        nodeEnv: env.NODE_ENV || "development",
        isProduction: env.NODE_ENV === "production",
        port: Number(env.PORT) || 3000,
        mongoUri: env.MONGO_URI,
        jwtSecret: env.JWT_SECRET,
        jwtExpiresInSeconds: 24 * 60 * 60,
        geminiApiKey: env.GOOGLE_GENAI_API_KEY,
        geminiModel: env.GEMINI_MODEL || "gemini-3.8-flash",
        clientUrl: env.CLIENT_URL || "http://localhost:5173",
        pdfConcurrency: Math.max(1, Number(env.PDF_CONCURRENCY) || 2),
        // Rate limits (each counts requests in memory, per server process)
        loginFailuresPer15Min: Number(env.LOGIN_FAILURES_PER_15_MIN) || 5,
        registerPerIpPerHour: Number(env.REGISTER_PER_IP_PER_HOUR) || 5,
        generatePerUserPerHour: Number(env.GENERATE_PER_USER_PER_HOUR) || 10,
        // Number of proxies in front of the app (e.g. 1 behind a load balancer) so the
        // per-IP limit sees the visitor's real IP. Leave unset when running directly.
        trustProxy: Number(env.TRUST_PROXY) || false,
        // Set to "true" when the frontend and backend are on different domains (e.g. two
        // hosting providers). The login cookie is then sent cross-site, which requires HTTPS.
        crossSiteCookie: env.CROSS_SITE_COOKIE === "true",
        // Set to "true" on hosts where Chrome can't start its sandbox (common on cloud servers
        // and containers). The PDF page already has JavaScript and network access turned off.
        chromeNoSandbox: env.CHROME_NO_SANDBOX === "true",
    })
}

module.exports = loadConfig()
