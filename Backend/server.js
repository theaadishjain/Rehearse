require("dotenv").config({ quiet: true })

let config
try {
    config = require("./src/config/env")
} catch (err) {
    console.error(`Configuration error: ${err.message}`)
    process.exit(1)
}

const app = require("./src/app")
const { connectToDB, disconnectFromDB } = require("./src/config/database")
const { closeBrowser } = require("./src/services/pdf.service")

async function start() {
    try {
        await connectToDB(config.mongoUri)
    } catch (err) {
        console.error(`Could not connect to MongoDB at ${config.mongoUri}: ${err.message}`)
        process.exit(1)
    }

    const server = app.listen(config.port, (err) => {
        if (err) {
            console.error(err.code === "EADDRINUSE"
                ? `Port ${config.port} is already in use. Set a different PORT in Backend/.env.`
                : err)
            process.exit(1)
        }
        console.log(`Server is running on port ${config.port}`)
    })

    const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down...`)
        server.close()
        await Promise.allSettled([ closeBrowser(), disconnectFromDB() ])
        process.exit(0)
    }
    process.on("SIGINT", shutdown)
    process.on("SIGTERM", shutdown)
}

start()
