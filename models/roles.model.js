const mongoose = require('mongoose');

const RolesSchema = mongoose.Schema({
    role: {
        type: String,
        require : true
    },
    password: {
        type: String,
        ref: 'user'
    },
})

module.exports = mongoose.model('roles', RolesSchema);