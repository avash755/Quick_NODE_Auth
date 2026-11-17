const {BrevoClient} = require('@getbrevo/brevo');

/// get the Brevo API key from .env
const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
})

/// send OTP to the user
const sendOtp = async(email, otp) =>{
    try{
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender:{
                name: process.env.BREVO_SENDER_NAME,
                email: process.env.BREVO_SENDER_EMAIL
            },
            to:[{email}],
            subject: "Your OTP for Signup/Login",
            textContent: `Your OTP is ${otp}. It will expire in 10 minutes.`
        })
        return response;
    }catch(err){
        console.error("There was an error sending the OTP: ", err);
        throw err;
    }
}

module.exports = sendOtp;