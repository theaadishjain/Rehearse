/*
 * Shared test setup. Must be required before anything from src/, because src/config/env.js
 * reads the environment once at load time.
 */
process.env.MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/interview-ai-test"
process.env.JWT_SECRET = "test-secret-for-automated-tests-only-0123456789"
process.env.GOOGLE_GENAI_API_KEY = "test-key"
process.env.CLIENT_URL = "http://localhost:5173"
process.env.NODE_ENV = "test"
process.env.PREVIEW_PER_IP_PER_HOUR = "3"
process.env.GENERATE_PER_USER_PER_HOUR = "8"

/**
 * Builds a minimal, valid one-page PDF containing the given text.
 */
function makePdf(text) {
    const content = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    ]

    let pdf = "%PDF-1.4\n"
    const offsets = []
    objects.forEach((body, i) => {
        offsets.push(pdf.length)
        pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
    })
    const xrefOffset = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    return Buffer.from(pdf, "latin1")
}

module.exports = { makePdf }
