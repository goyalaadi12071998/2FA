const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp : {
        type : Number
    },
    verfyingEmail : {
        type : String,
        unique : true
    }
});

module.exports = mongoose.model('otp', otpSchema);