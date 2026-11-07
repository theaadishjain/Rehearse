const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const { validateBody, validateObjectIdParam } = require("../middlewares/validate.middleware")
const { generateReportSchema } = require("../validators/interview.validator")
const { generatePerUser } = require("../middlewares/rateLimit.middleware")

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/",
    authMiddleware.authUser,
    upload.single("resume"),
    validateBody(generateReportSchema),
    generatePerUser, // after validation, so a form mistake doesn't use up the user's hourly limit
    interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId",
    authMiddleware.authUser,
    validateObjectIdParam("interviewId"),
    interviewController.getInterviewReportByIdController)

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId",
    authMiddleware.authUser,
    validateObjectIdParam("interviewReportId"),
    generatePerUser,
    interviewController.generateResumePdfController)

module.exports = interviewRouter
