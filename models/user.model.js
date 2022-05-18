const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    username :  {
        type : String,
        require : true,
    },
    password : {
        type : String,
        require : true,
    },
    role : {
        type : String,
        ref : 'roles',
    },
})

module.exports = mongoose.model('user', UsersSchema);