const config = require("../config/env")

/**
 * Options for the auth cookie.
 * - httpOnly: page JavaScript (and therefore XSS) cannot read the token.
 * - secure: only sent over HTTPS in production.
 * - sameSite "lax": not sent on cross-site POSTs, which blocks CSRF. localhost:5173 and
 *   localhost:3000 count as the same site, so local development still works. If you deploy
 *   frontend and backend on different domains, change this to "none" (requires secure).
 */
function authCookieOptions() {
    return {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        path: "/"
    }
}

function setAuthCookie(res, token) {
    res.cookie("token", token, {
        ...authCookieOptions(),
        maxAge: config.jwtExpiresInSeconds * 1000
    })
}

function clearAuthCookie(res) {
    res.clearCookie("token", authCookieOptions())
}

module.exports = { setAuthCookie, clearAuthCookie }
