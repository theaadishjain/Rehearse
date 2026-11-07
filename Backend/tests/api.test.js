/*
 * API tests. They need a running MongoDB (default mongodb://127.0.0.1:27017, override with
 * TEST_MONGO_URI) and use a separate "interview-ai-test" database that is dropped afterwards.
 * The Gemini calls are replaced with a stub, so no API key or network access is needed.
 */
const { makePdf } = require("./helpers")
const { test, describe, before, after } = require("node:test")
const assert = require("node:assert/strict")
const Module = require("node:module")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const request = require("supertest")

// ---- Stub the AI service before the app loads it ----
const aiCalls = []
const fakeReport = {
    matchScore: 72,
    title: "Backend Engineer",
    technicalQuestions: [ { question: "Explain indexes", intention: "DB depth", answer: "B-trees..." } ],
    behavioralQuestions: [ { question: "A conflict?", intention: "Teamwork", answer: "STAR..." } ],
    skillGaps: [ { skill: "Kubernetes", severity: "medium" } ],
    preparationPlan: [ { day: 1, focus: "Databases", tasks: [ "Read about indexes" ] } ]
}
const aiServicePath = require.resolve("../src/services/ai.service")
const stub = new Module(aiServicePath)
stub.filename = aiServicePath
stub.loaded = true
stub.exports = {
    generateInterviewReport: async (input) => { aiCalls.push(input); return structuredClone(fakeReport) },
    generateInterviewPreview: async () => ({ title: "Backend Engineer", questions: fakeReport.technicalQuestions.concat(fakeReport.behavioralQuestions) }),
    generateResumePdf: async () => Buffer.from("%PDF-1.4 stub")
}
require.cache[ aiServicePath ] = stub

const app = require("../src/app")
const config = require("../src/config/env")
const tokenBlacklistModel = require("../src/models/blacklist.model")
const interviewReportModel = require("../src/models/interviewReport.model")

const JOB = "We are hiring a backend engineer with strong Node.js, MongoDB and API design experience."

function newUser(name) {
    return { username: name, email: `${name}@example.com`, password: "correct-horse-1" }
}

async function registeredAgent(name) {
    const agent = request.agent(app)
    const res = await agent.post("/api/auth/register").send(newUser(name))
    assert.equal(res.status, 201, res.text)
    return agent
}

before(async () => {
    await mongoose.connect(config.mongoUri)
    await mongoose.connection.dropDatabase()
    await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()))
})

after(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
})

describe("auth: input validation (problem 3)", () => {
    test("register with missing fields is a 400 with a readable message", async () => {
        const res = await request(app).post("/api/auth/register").send({})
        assert.equal(res.status, 400)
        assert.match(res.body.message, /required/i)
        assert.ok(Array.isArray(res.body.errors))
    })

    test("register with no body at all is a 400, not a crash", async () => {
        const res = await request(app).post("/api/auth/register")
        assert.equal(res.status, 400)
    })

    test("register rejects a bad email and a short password", async () => {
        const res = await request(app).post("/api/auth/register")
            .send({ username: "bob", email: "not-an-email", password: "short" })
        assert.equal(res.status, 400)
        const fields = res.body.errors.map((e) => e.field)
        assert.deepEqual(fields.sort(), [ "email", "password" ])
    })

    test("login without a password is a 400", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "a@example.com" })
        assert.equal(res.status, 400)
        assert.match(res.body.message, /password/i)
    })

    test("malformed JSON is a 400", async () => {
        const res = await request(app).post("/api/auth/login")
            .set("Content-Type", "application/json").send("{not json")
        assert.equal(res.status, 400)
        assert.match(res.body.message, /JSON/)
    })

    test("unknown routes return a JSON 404", async () => {
        const res = await request(app).get("/api/nope")
        assert.equal(res.status, 404)
        assert.match(res.body.message, /not found/i)
    })
})

describe("auth: cookie and session handling (problem 2)", () => {
    test("register sets an HttpOnly, SameSite=Lax cookie with an expiry", async () => {
        const res = await request(app).post("/api/auth/register").send(newUser("cookieuser"))
        assert.equal(res.status, 201)
        const cookie = res.headers[ "set-cookie" ][ 0 ]
        assert.match(cookie, /HttpOnly/)
        assert.match(cookie, /SameSite=Lax/)
        assert.match(cookie, /Max-Age=86400/)
        assert.doesNotMatch(cookie, /Secure/) // only in production
    })

    test("registering the same email again is a 409, and emails are case-insensitive", async () => {
        const res = await request(app).post("/api/auth/register")
            .send({ ...newUser("cookieuser2"), email: "COOKIEUSER@example.com" })
        assert.equal(res.status, 409)
    })

    test("wrong password is a 401, correct one logs in", async () => {
        const bad = await request(app).post("/api/auth/login")
            .send({ email: "cookieuser@example.com", password: "wrong-password" })
        assert.equal(bad.status, 401)

        const good = await request(app).post("/api/auth/login")
            .send({ email: "CookieUser@example.com", password: "correct-horse-1" })
        assert.equal(good.status, 200)
        assert.equal(good.body.user.username, "cookieuser")
    })

    test("logout blacklists the token until it expires, and the token stops working", async () => {
        const agent = await registeredAgent("logoutuser")
        assert.equal((await agent.get("/api/auth/get-me")).status, 200)

        const login = await request(app).post("/api/auth/login")
            .send({ email: "logoutuser@example.com", password: "correct-horse-1" })
        const token = login.headers[ "set-cookie" ][ 0 ].match(/token=([^;]+)/)[ 1 ]

        const out = await request(app).get("/api/auth/logout").set("Cookie", `token=${token}`)
        assert.equal(out.status, 200)
        assert.match(out.headers[ "set-cookie" ][ 0 ], /token=;/)

        const row = await tokenBlacklistModel.findOne({ token })
        assert.equal(row.expiresAt.getTime(), jwt.decode(token).exp * 1000)

        const after = await request(app).get("/api/auth/get-me").set("Cookie", `token=${token}`)
        assert.equal(after.status, 401)
    })

    test("blacklist rows are removed automatically by a TTL index (problem 5)", async () => {
        const indexes = await tokenBlacklistModel.collection.indexes()
        const ttl = indexes.find((i) => i.key.expiresAt === 1)
        assert.ok(ttl, "expected an index on expiresAt")
        assert.equal(ttl.expireAfterSeconds, 0)
    })

    test("requests without a cookie are a 401", async () => {
        const res = await request(app).get("/api/auth/get-me")
        assert.equal(res.status, 401)
    })
})

describe("interview reports: upload validation (problem 3)", () => {
    let agent
    before(async () => { agent = await registeredAgent("uploader") })

    test("no resume and no self description is a 400", async () => {
        const res = await agent.post("/api/interview/").field("jobDescription", JOB)
        assert.equal(res.status, 400)
        assert.match(res.body.message, /resume|self description/i)
    })

    test("missing job description is a 400", async () => {
        const res = await agent.post("/api/interview/").field("selfDescription", "I build APIs")
        assert.equal(res.status, 400)
        assert.match(res.body.message, /job description/i)
    })

    test("a non-PDF upload is a 400", async () => {
        const res = await agent.post("/api/interview/")
            .field("jobDescription", JOB)
            .attach("resume", Buffer.from("hello"), { filename: "resume.txt", contentType: "text/plain" })
        assert.equal(res.status, 400)
        assert.match(res.body.message, /PDF/)
    })

    test("a file pretending to be a PDF is a 400", async () => {
        const res = await agent.post("/api/interview/")
            .field("jobDescription", JOB)
            .attach("resume", Buffer.from("not really a pdf"), { filename: "resume.pdf", contentType: "application/pdf" })
        assert.equal(res.status, 400)
        assert.match(res.body.message, /PDF/)
    })

    test("a file over 3MB is a 413", async () => {
        const big = Buffer.concat([ Buffer.from("%PDF-1.4\n"), Buffer.alloc(3 * 1024 * 1024 + 10) ])
        const res = await agent.post("/api/interview/")
            .field("jobDescription", JOB)
            .attach("resume", big, { filename: "resume.pdf", contentType: "application/pdf" })
        assert.equal(res.status, 413)
        assert.match(res.body.message, /3MB/)
    })

    test("a real PDF is parsed and its text is sent to the AI", async () => {
        aiCalls.length = 0
        const res = await agent.post("/api/interview/")
            .field("jobDescription", JOB)
            .attach("resume", makePdf("Jane Doe Senior Node Developer"), { filename: "resume.pdf", contentType: "application/pdf" })
        assert.equal(res.status, 201, res.text)
        assert.match(aiCalls[ 0 ].resume, /Jane Doe Senior Node Developer/)
        assert.equal(res.body.interviewReport.title, "Backend Engineer")
    })

    test("a self description alone is enough", async () => {
        const res = await agent.post("/api/interview/")
            .field("jobDescription", JOB)
            .field("selfDescription", "Five years building Node.js APIs.")
        assert.equal(res.status, 201, res.text)
    })
})

describe("interview reports: ownership (problem 1)", () => {
    let alice, mallory, aliceReportId

    before(async () => {
        alice = await registeredAgent("alice")
        mallory = await registeredAgent("mallory")
        const res = await alice.post("/api/interview/")
            .field("jobDescription", JOB)
            .field("selfDescription", "Alice's private career history.")
        aliceReportId = res.body.interviewReport._id
    })

    test("the owner can download their tailored resume PDF", async () => {
        const res = await alice.post(`/api/interview/resume/pdf/${aliceReportId}`)
            .buffer(true).parse((r, cb) => {
                const chunks = []
                r.on("data", (c) => chunks.push(c))
                r.on("end", () => cb(null, Buffer.concat(chunks)))
            })
        assert.equal(res.status, 200)
        assert.equal(res.headers[ "content-type" ], "application/pdf")
        assert.equal(res.body.subarray(0, 5).toString(), "%PDF-")
    })

    test("another user cannot download someone else's resume PDF", async () => {
        const res = await mallory.post(`/api/interview/resume/pdf/${aliceReportId}`)
        assert.equal(res.status, 404)
    })

    test("another user cannot read someone else's report", async () => {
        const res = await mallory.get(`/api/interview/report/${aliceReportId}`)
        assert.equal(res.status, 404)
    })

    test("another user's report does not appear in their list", async () => {
        const res = await mallory.get("/api/interview/")
        assert.equal(res.status, 200)
        assert.equal(res.body.interviewReports.length, 0)
    })

    test("a malformed report id is a 404, not a 500", async () => {
        const res = await alice.get("/api/interview/report/not-an-id")
        assert.equal(res.status, 404)
    })
})

describe("public preview and rate limits", () => {
    test("the preview needs no account, validates input and stores nothing", async () => {
        const before = await interviewReportModel.countDocuments()

        const bad = await request(app).post("/api/interview/preview").send({ jobDescription: "too short" })
        assert.equal(bad.status, 400)

        const ok = await request(app).post("/api/interview/preview").send({ jobDescription: JOB })
        assert.equal(ok.status, 200, ok.text)
        assert.equal(ok.body.preview.title, "Backend Engineer")
        assert.ok(ok.body.preview.questions.length >= 1)

        assert.equal(await interviewReportModel.countDocuments(), before)
    })

    test("the preview is limited per IP (3 per hour in tests)", async () => {
        // Two requests were used by the previous test.
        const third = await request(app).post("/api/interview/preview").send({ jobDescription: JOB })
        assert.equal(third.status, 200)

        const fourth = await request(app).post("/api/interview/preview").send({ jobDescription: JOB })
        assert.equal(fourth.status, 429)
        assert.match(fourth.body.message, /Create an account/)
        assert.ok(fourth.headers[ "ratelimit" ] || fourth.headers[ "ratelimit-policy" ])
    })

    test("logged-in users are limited when generating (8 per hour in tests)", async () => {
        const agent = await registeredAgent("busyuser")
        for (let i = 0; i < 8; i++) {
            const res = await agent.post("/api/interview/").field("jobDescription", JOB).field("selfDescription", "Node dev")
            assert.equal(res.status, 201, `request ${i + 1}: ${res.text}`)
        }
        const blocked = await agent.post("/api/interview/").field("jobDescription", JOB).field("selfDescription", "Node dev")
        assert.equal(blocked.status, 429)
        assert.match(blocked.body.message, /wait/)

        // The limit is per user: someone else is unaffected
        const other = await registeredAgent("calmuser")
        const res = await other.post("/api/interview/").field("jobDescription", JOB).field("selfDescription", "Node dev")
        assert.equal(res.status, 201)
    })
})
