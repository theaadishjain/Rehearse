const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [ true, "token is required to be added in blacklist" ],
        unique: true
    },
    // When the JWT itself expires. After that the token is useless anyway, so MongoDB's
    // TTL monitor deletes the row and the collection no longer grows forever.
    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    }
}, {
    timestamps: true
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = tokenBlacklistModel
