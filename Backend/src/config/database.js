const mongoose = require("mongoose")

async function connectToDB(uri) {
    await mongoose.connect(uri)
    console.log("Connected to Database")
}

async function disconnectFromDB() {
    await mongoose.disconnect()
}

module.exports = { connectToDB, disconnectFromDB }
