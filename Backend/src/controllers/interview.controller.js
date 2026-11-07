const { PDFParse } = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const AppError = require("../utils/AppError")

const MAX_RESUME_CHARS = 20_000

/**
 * Extracts plain text from an uploaded PDF, rejecting files that are not real PDFs.
 */
async function extractResumeText(buffer) {
    // The browser-reported mimetype can be faked; check the file's actual signature.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        throw new AppError(400, "Resume must be a PDF file.")
    }

    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    try {
        const result = await parser.getText()
        return result.text.trim().slice(0, MAX_RESUME_CHARS)
    } catch {
        throw new AppError(400, "We couldn't read this PDF. Make sure it isn't password-protected or damaged.")
    } finally {
        await parser.destroy().catch(() => { })
    }
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const { selfDescription, jobDescription } = req.body

    const resumeText = req.file ? await extractResumeText(req.file.buffer) : ""

    if (!resumeText && !selfDescription) {
        throw new AppError(400, req.file
            ? "We couldn't find any text in this PDF (it may be a scanned image). Please add a short self description instead."
            : "Please upload your resume (PDF) or write a short self description.")
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        throw new AppError(404, "Interview report not found.")
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    // Scope the lookup to the logged-in user so nobody can download another user's resume.
    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        throw new AppError(404, "Interview report not found.")
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })
    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }
