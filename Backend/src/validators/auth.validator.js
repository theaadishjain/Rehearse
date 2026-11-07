const { z } = require("zod")

const email = z.string({ required_error: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")

const registerSchema = z.object({
    username: z.string({ required_error: "Username is required." })
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username must be at most 30 characters.")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, dashes and underscores."),
    email,
    password: z.string({ required_error: "Password is required." })
        .min(8, "Password must be at least 8 characters.")
        .max(72, "Password must be at most 72 characters.") // bcrypt ignores bytes past 72
})

const loginSchema = z.object({
    email,
    password: z.string({ required_error: "Password is required." }).min(1, "Password is required.")
})

module.exports = { registerSchema, loginSchema }
