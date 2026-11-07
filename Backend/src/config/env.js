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
        previewPerIpPerHour: Number(env.PREVIEW_PER_IP_PER_HOUR) || 3,
        previewPerDay: Number(env.PREVIEW_PER_DAY) || 200,
        generatePerUserPerHour: Number(env.GENERATE_PER_USER_PER_HOUR) || 10,
        // Number of proxies in front of the app (e.g. 1 behind a load balancer) so the
        // per-IP limit sees the visitor's real IP. Leave unset when running directly.
        trustProxy: Number(env.TRUST_PROXY) || false,
    })
}

module.exports = loadConfig()
