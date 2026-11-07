import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interviewContext"
import { useParams } from "react-router"
import { getErrorMessage } from "../../../lib/api"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context
    const [ downloading, setDownloading ] = useState(false)

    /** @returns the new report, or null if it failed (the message is in `error`) */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError("")
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            setError(await getErrorMessage(err, "Could not generate your interview plan. Please try again."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        setError("")
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            setReport(null)
            setError(await getErrorMessage(err, "Could not load this interview plan."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (err) {
            setError(await getErrorMessage(err, "Could not load your previous interview plans."))
            return []
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setDownloading(true)
        setError("")
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (err) {
            setError(await getErrorMessage(err, "Could not generate your resume PDF. Please try again."))
        } finally {
            setDownloading(false)
        }
    }

    // Load the report (or the list) for the current page. If the user moves to another
    // report before this one arrives, the older response is ignored so it can't overwrite it.
    useEffect(() => {
        let ignore = false
        setLoading(true)
        setError("")

        const request = interviewId
            ? getInterviewReportById(interviewId).then((res) => { if (!ignore) setReport(res.interviewReport) })
            : getAllInterviewReports().then((res) => { if (!ignore) setReports(res.interviewReports) })

        request
            .catch(async (err) => {
                const message = await getErrorMessage(err, interviewId
                    ? "Could not load this interview plan."
                    : "Could not load your previous interview plans.")
                if (ignore) return
                if (interviewId) setReport(null)
                setError(message)
            })
            .finally(() => { if (!ignore) setLoading(false) })

        return () => { ignore = true }
    }, [ interviewId, setLoading, setError, setReport, setReports ])

    return { loading, downloading, error, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
