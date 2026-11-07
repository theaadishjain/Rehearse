/**
 * An error that is safe to show to the client: it carries an HTTP status and a
 * human-readable message. Anything that is not an AppError is reported as a generic 500.
 */
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message)
        this.name = "AppError"
        this.statusCode = statusCode
        this.details = details
    }
}

module.exports = AppError
