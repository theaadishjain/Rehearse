/**
 * Tidies up a report from the AI before it is saved. The model sometimes leaves a field empty
 * (an empty question, a day with no focus). The database requires those fields, so saving would
 * fail and the user would get a generic error. Instead, incomplete items are dropped.
 */
const hasText = (value) => typeof value === "string" && value.trim() !== ""

const isCompleteQuestion = (q) => hasText(q.question) && hasText(q.intention) && hasText(q.answer)

function cleanReport(report) {
    return {
        ...report,
        title: hasText(report.title) ? report.title.trim() : "Interview plan",
        matchScore: Math.min(100, Math.max(0, Math.round(report.matchScore))),
        technicalQuestions: report.technicalQuestions.filter(isCompleteQuestion),
        behavioralQuestions: report.behavioralQuestions.filter(isCompleteQuestion),
        skillGaps: report.skillGaps.filter((gap) => hasText(gap.skill)),
        preparationPlan: report.preparationPlan
            .map((day) => ({ ...day, tasks: day.tasks.filter(hasText) }))
            .filter((day) => hasText(day.focus))
    }
}

module.exports = cleanReport
