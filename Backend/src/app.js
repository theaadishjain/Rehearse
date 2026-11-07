const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const config = require("./config/env")
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware")

const app = express()

app.set("trust proxy", config.trustProxy)

app.use(express.json({ limit: "100kb" }))
app.use(cookieParser())
app.use(cors({
    origin: config.clientUrl,
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.get("/api/health", (req, res) => res.json({ status: "ok" }))
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
