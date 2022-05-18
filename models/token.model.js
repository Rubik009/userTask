const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    refreshToken: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('tokens', TokenSchema);