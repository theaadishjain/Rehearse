const jwt = require("jsonwebtoken")
const config = require("../config/env")
const tokenBlacklistModel = require("../models/blacklist.model")
const AppError = require("../utils/AppError")

async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        throw new AppError(401, "Please log in to continue.")
    }

    let decoded
    try {
        decoded = jwt.verify(token, config.jwtSecret)
    } catch {
        throw new AppError(401, "Your session has expired. Please log in again.")
    }

    const isTokenBlacklisted = await tokenBlacklistModel.exists({ token })
    if (isTokenBlacklisted) {
        throw new AppError(401, "Your session has ended. Please log in again.")
    }

    req.user = decoded
    next()
}

module.exports = { authUser }
