const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    otpAttempts:{
        type: Number,
        default: 0
    },
    tokenVersion:{
        type: Number,
        default: 0
    },
    
    otp: String,
    otpExpiry: Date

},
{
    timestamps: true
})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;