const express = require('express');

const {
    signup,
    verify,
    resendOTP,
    sentOTP,
    forgotPassword,
    login,
    logout,
    tokenCheck,
    users
} = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware'); /// Importing authentication middlewares

const router = express.Router();



//// All Api routes:
router.post('/signup', signup);
router.post('/verify', authenticate, verify);
router.post('/resend-otp', resendOTP);
router.post('/sentOTP', sentOTP);
router.post('/forgot-password', forgotPassword);
router.post('/login', login);
router.post('/logout', logout);

router.get('/users', authenticate, users);

router.get('/me', authenticate, tokenCheck);

module.exports = router;