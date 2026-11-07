const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { validateBody } = require("../middlewares/validate.middleware")
const { registerSchema, loginSchema } = require("../validators/auth.validator")
const { loginAttempts, registerPerIp } = require("../middlewares/rateLimit.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public, rate limited per IP
 */
authRouter.post("/register", registerPerIp, validateBody(registerSchema), authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public, failed attempts rate limited per IP and email
 */
authRouter.post("/login", loginAttempts, validateBody(loginSchema), authController.loginUserController)

/**
 * @route POST /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist.
 * POST, not GET, so another site can't log users out with a plain link.
 * @access public
 */
authRouter.post("/logout", authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = authRouter
