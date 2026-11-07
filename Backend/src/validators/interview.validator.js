const { z } = require("zod")

const generateReportSchema = z.object({
    jobDescription: z.string({ required_error: "Job description is required." })
        .trim()
        .min(30, "Job description is too short. Please paste the full job description.")
        .max(5000, "Job description must be at most 5000 characters."),
    selfDescription: z.string()
        .trim()
        .max(3000, "Self description must be at most 3000 characters.")
        .optional()
        .default("")
})

const previewSchema = z.object({
    jobDescription: generateReportSchema.shape.jobDescription,
    selfDescription: z.string()
        .trim()
        .max(1000, "Keep the description of yourself under 1000 characters.")
        .optional()
        .default("")
})

module.exports = { generateReportSchema, previewSchema }
