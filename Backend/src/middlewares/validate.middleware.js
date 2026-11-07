const mongoose = require("mongoose")
const AppError = require("../utils/AppError")

/**
 * Validates req.body against a zod schema and replaces it with the parsed (trimmed,
 * normalised) value. Responds 400 with per-field messages on failure.
 */
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body ?? {})
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join(".") || undefined,
                message: issue.message
            }))
            throw new AppError(400, errors[ 0 ].message, errors)
        }
        req.body = result.data
        next()
    }
}

/**
 * Rejects malformed MongoDB ids up front so they produce a 404 rather than a CastError 500.
 */
function validateObjectIdParam(paramName) {
    return (req, res, next) => {
        if (!mongoose.isValidObjectId(req.params[ paramName ])) {
            throw new AppError(404, "Interview report not found.")
        }
        next()
    }
}

module.exports = { validateBody, validateObjectIdParam }
