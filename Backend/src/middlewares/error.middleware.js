const multer = require("multer")
const AppError = require("../utils/AppError")

function notFoundHandler(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

/**
 * Central error handler. Express 5 forwards rejected promises from async handlers here,
 * so controllers can simply throw.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(err.details ? { errors: err.details } : {})
        })
    }

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Resume file is too large. The maximum size is 3MB."
            : `File upload error: ${err.message}`
        return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message })
    }

    // Malformed JSON body from express.json()
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Request body is not valid JSON." })
    }

    // Duplicate key (e.g. two registrations racing for the same email)
    if (err.code === 11000) {
        return res.status(409).json({ message: "Account already exists with this email address or username." })
    }

    console.error(err)
    res.status(500).json({ message: "Something went wrong on our side. Please try again." })
}

module.exports = { notFoundHandler, errorHandler }
