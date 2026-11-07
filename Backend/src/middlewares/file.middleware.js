const multer = require("multer")
const AppError = require("../utils/AppError")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 1
    },
    fileFilter(req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new AppError(400, "Resume must be a PDF file."))
        }
        cb(null, true)
    }
})

module.exports = upload
