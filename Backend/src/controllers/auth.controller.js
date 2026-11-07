const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("../config/env")
const tokenBlacklistModel = require("../models/blacklist.model")
const AppError = require("../utils/AppError")
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookie")

function signToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresInSeconds }
    )
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email
    }
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body

    // Case-insensitive, so "Aadish" and "aadish" can't be two different accounts
    const isUserAlreadyExists = await userModel.exists({
        $or: [ { username }, { email } ]
    }).collation({ locale: "en", strength: 2 })

    if (isUserAlreadyExists) {
        throw new AppError(409, "Account already exists with this email address or username.")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    setAuthCookie(res, signToken(user))

    res.status(201).json({
        message: "User registered successfully",
        user: publicUser(user)
    })
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password.")
    }

    setAuthCookie(res, signToken(user))

    res.status(200).json({
        message: "User loggedIn successfully.",
        user: publicUser(user)
    })
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist until it expires
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        const decoded = jwt.decode(token)
        // Only valid-looking tokens with an expiry are worth blacklisting; anything else
        // would be rejected by jwt.verify anyway.
        if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
            await tokenBlacklistModel.updateOne(
                { token },
                { $setOnInsert: { token, expiresAt: new Date(decoded.exp * 1000) } },
                { upsert: true }
            )
        }
    }

    clearAuthCookie(res)

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        clearAuthCookie(res)
        throw new AppError(401, "This account no longer exists.")
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: publicUser(user)
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
