/*
 * Renders HTML with a real headless Chrome, so this test is slower (a few seconds).
 * It checks that HTML from the AI cannot make the server load anything (problem 4) and that
 * the shared browser produces real PDF buffers (problem 5).
 */
require("./helpers")
const { test, after } = require("node:test")
const assert = require("node:assert/strict")
const http = require("node:http")
const { htmlToPdf, closeBrowser } = require("../src/services/pdf.service")

after(closeBrowser)

test("AI-written HTML cannot make the server fetch URLs or run scripts", async () => {
    const hits = []
    const server = http.createServer((req, res) => { hits.push(req.url); res.end("x") })
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
    const base = `http://127.0.0.1:${server.address().port}`

    try {
        const html = `<!doctype html><html><head>
            <link rel="stylesheet" href="${base}/style.css">
            <style>@import url("${base}/import.css"); body { background: url("${base}/bg.png") }</style>
        </head><body>
            <h1>Jane Doe</h1>
            <img src="${base}/pixel.png">
            <iframe src="${base}/frame"></iframe>
            <script>fetch("${base}/script")</script>
        </body></html>`

        const pdf = await htmlToPdf(html)

        assert.ok(Buffer.isBuffer(pdf), "expected a Node Buffer")
        assert.equal(pdf.subarray(0, 5).toString(), "%PDF-")
        assert.deepEqual(hits, [], `server was contacted: ${hits.join(", ")}`)
    } finally {
        server.close()
    }
})

test("concurrent renders share one browser and all succeed", async () => {
    const pdfs = await Promise.all(
        [ 1, 2, 3, 4 ].map((n) => htmlToPdf(`<h1>Resume ${n}</h1>`))
    )
    for (const pdf of pdfs) {
        assert.equal(pdf.subarray(0, 5).toString(), "%PDF-")
    }
})
