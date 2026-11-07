const puppeteer = require("puppeteer")
const config = require("../config/env")

/*
 * One shared headless Chrome for the whole server instead of launching a new one per
 * request (launching costs ~1s and 100+ MB each time). Each request gets its own tab.
 */
let browserPromise = null

function getBrowser() {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            args: [
                "--disable-dev-shm-usage",
                ...(config.chromeNoSandbox ? [ "--no-sandbox", "--disable-setuid-sandbox" ] : [])
            ]
        }).then((browser) => {
            browser.on("disconnected", () => { browserPromise = null })
            return browser
        }).catch((err) => {
            browserPromise = null
            throw err
        })
    }
    return browserPromise
}

async function closeBrowser() {
    if (!browserPromise) return
    const browser = await browserPromise.catch(() => null)
    browserPromise = null
    if (browser) await browser.close().catch(() => { })
}

/*
 * Limit how many PDFs render at once so a burst of requests can't exhaust memory.
 * Extra requests wait in line. A finishing job hands its slot straight to the next one.
 */
let active = 0
const waiting = []

async function withRenderSlot(task) {
    if (active >= config.pdfConcurrency) {
        await new Promise((resolve) => waiting.push(resolve))
    } else {
        active++
    }
    try {
        return await task()
    } finally {
        const next = waiting.shift()
        if (next) next()
        else active--
    }
}

/**
 * Renders untrusted HTML (it comes from the AI, which reads user-supplied text) to a PDF.
 * The page is locked down: JavaScript is disabled and every network request is blocked
 * except inline data: URLs, so the HTML cannot make the server fetch anything.
 */
async function htmlToPdf(html) {
    return withRenderSlot(async () => {
        const browser = await getBrowser()
        const page = await browser.newPage()
        try {
            await page.setJavaScriptEnabled(false)
            await page.setRequestInterception(true)
            page.on("request", (request) => {
                const url = request.url()
                if (url.startsWith("data:") || url === "about:blank") {
                    request.continue()
                } else {
                    request.abort("blockedbyclient")
                }
            })

            await page.setContent(html, { waitUntil: "load", timeout: 15_000 })

            const pdf = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20mm",
                    bottom: "20mm",
                    left: "15mm",
                    right: "15mm"
                }
            })
            // puppeteer returns a Uint8Array; normalise to a Node Buffer for callers.
            return Buffer.from(pdf)
        } finally {
            await page.close().catch(() => { })
        }
    })
}

module.exports = { htmlToPdf, closeBrowser }
