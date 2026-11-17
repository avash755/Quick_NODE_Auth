const userModel = require('../db/models/userModel'); /// Importing the user model
const sendOtp = require('../utils/sendOtp'); /// Importing the sendOtp function
const bcrypt = require('bcrypt'); /// Importing bcrypt for password hashing
const crypto = require('crypto'); /// Importing crypto for generating OTP
const jwt = require('jsonwebtoken'); /// Importing jwt for token generation
const {z} = require('zod');

/// Shortcut variables 
const signUpSchema = z.object({
    username: z.string().trim().min(3).max(33),
    email: z.string().trim().email(),
    password: z.string().min(8).max(111)
});

/// all the controller functions for authentication are defined here
async function signup(req, res) {
    try{
        /// Verifying inputs
        const result = signUpSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: "Invalid input.",
                error: result.error.flatten()
            })
        }

        const { username, email, password } = result.data;
        
        /// Normalize the given inputs. 
        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        /// check if all required fields are provided
        if(!(username && password && email)){
            return res.status(400).json({
                message: "All fields are required!"
            })
        }

        /// Check if the user already exists
        const isUserExists = await userModel.findOne({
            $or: [{
                username: normalizedUsername
            },{
                email: normalizedEmail
            }]
        })

        /// if user already exists, return an error response
        if(isUserExists){
            return res.status(409).json({
                message: "User already exists!"
            })
        }

        /// if user does not exist, create a password hash, otp, and otp expiry time
        const passwordHash = await bcrypt.hash(password, 11);
        const otp = crypto.randomInt(1000000, 9999999).toString();
        const otpHash = await bcrypt.hash(otp, 11);
        const otpExpiry = new Date(Date.now() + 11 * 60 * 1000);

        /// Send OTP to the user
        await sendOtp(email, otp)

        /// Create a new user
        const user = await userModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: passwordHash,
            otp: otpHash,
            otpExpiry
        })
        
        /// send cookie with the token to the user
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            tokenVersion: user.tokenVersion
        }, process.env.JWT_SECRET, {expiresIn: '33d'})
        
        /// send the token in the cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 33 * 24 * 60 * 60 * 1000
        });

        /// Send a response to the user with the token and user details
        return res.status(201).json({
            message: "User created successfully! Please check your email for the OTP.",
            user: {
                username: user.username,
                email: user.email,
                isVerified: user.isVerified
            }
        })
    }catch(err){
        console.error("There was an error signing up the user: ", err);
        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}
async function verify(req, res){
    try{
        const {otp} = req.body;

        /// Getting the user data and verifying whether the user is already verified or not 
        const user = req.user;
        if(user.isVerified){
            return res.status(400).json({
                message: "user already Verified"
            })
        }
        
        /// Verifying whether the OTP exists or not and whether the time has expired or not  
        if(!(user.otp && user.otpExpiry)){
            return res.status(400).json({
                message: "No active OTP found."
            })
        }
        if(user.otpExpiry < new Date()){
            return res.status(400).json({
                message: "OTP expired! Send a new one."
            })
        }

        /// Count otp attemps
        if(user.otpAttempts > 5){
            user.otp = null;
            user.otpExpiry = null;
            user.otpAttempts = 0;
            await user.save();
            return res.status(429).json({
                message: "Too many attemps, request a new code"
            })
        }

        /// Verify OTP for the verification. 
        const isOtpValid = await bcrypt.compare(otp, user.otp);
        if(!isOtpValid){
            user.otpAttempts += 1;
            await user.save();
            return res.status(400).json({
                message: "Invalid, Wrong OTP ;("
            })
        }

        /// Verify the user. Make the OTP and expire OTP null in the database
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        /// save the Changes to database 
        await user.save();

        /// generate a token for the user
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            tokenVersion: user.tokenVersion
        },process.env.JWT_SECRET, {expiresIn: '30d'});
        
        /// send a secure cookie
        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        /// return the output
        return res.status(200).json({
            message: "Your account has been Successfully created ;)",
            user: {
                username : user.username,
                email : user.email,
                isVerified : user.isVerified
            }
        })

    }catch(err){
        console.error("There was an error verifying the user: ", err);
        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}
async function resendOTP(req, res){
    try{
        const user = req.user;
        /// Checking if the user is already verified or not. 
        if(user.isVerified){
            return res.status(400).json({
                message: "user already Verified"
            })
        }

        /// create otp code, otphashed, otp expired 
        const otp = crypto.randomInt(1000000, 9999999).toString();
        const otpHash = await bcrypt.hash(otp, 11);
        const otpExpiry = new Date(Date.now() + 11 * 60 * 1000);
        
        /// Send OTP to the user
        await sendOtp(user.email, otp) 

        /// update database with the new code
        user.otp = otpHash;
        user.otpExpiry = otpExpiry;
        user.otpAttempts = 0;
        await user.save();
        
        return res.status(202).json({
            message: "Otp has been sent to your mail. ",
            user: {
                username : user.username,
                email : user.email,
                isVerified : user.isVerified
            }
        })
    }catch(err){
        console.error("You got some error On resentOtp", err);
        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}
async function sentOTP(req, res){
    try{
        const user = req.user;
        
        /// Generate an OTP and send it to the user's email. 
        const otp = crypto.randomInt(1000000, 9999999).toString();
        const otpHash = await bcrypt.hash(otp, 11);
        const otpExpiry = new Date(Date.now() + 11 * 60 * 1000);
        
        /// Send OTP to the user
        await sendOtp(user.email, otp) 

        /// update database with the new code
        user.otp = otpHash;
        user.otpExpiry = otpExpiry;
        user.otpAttempts = 0;
        await user.save();
        
        return res.status(202).json({
            message: "Otp has been sent to your mail for reset-password ",
            user: {
                username : user.username,
                email : user.email,
                isVerified : user.isVerified
            }
        })
    }catch(err){
        console.error("You got some error On SentOTP", err);
        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}
async function forgotPassword(req, res){
    try{
        const {email, otp, newPassword} = req.body;

        /// If the given data is empty
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP, and new password are required."
            });
        }
        
        /// Normalize the given inputs. 
        const normalizedEmail = email.trim().toLowerCase();

        /// get user details and Check if it exists or not.
        const user = await userModel.findOne({email: normalizedEmail});
        if(!user){
            return res.status(400).json({
                message: "user don't exist"
            })
        }

        /// Checking if the OTPs exist in the database or not 
        if(!(user.otp && user.otpExpiry)){
            return res.status(400).json({
                message: "No active OTP found."
            })
        }
        /// Check if the OTP is still under expiration. 
        if(user.otpExpiry < new Date()){
            return res.status(400).json({
                message: "OTP expired! Send a new one."
            })
        }
        /// verify the otp for Validation 
        const isOtpValid = await bcrypt.compare(otp, user.otp);
        if(!isOtpValid){
            return res.status(401).json({
                message: "Unauthorized, Wrong OTP ;("
            })
        }
        /// hash the password and update it to db
        const hashPassword = await bcrypt.hash(newPassword, 11);
        user.password = hashPassword;

        /// Verify the user. Make the OTP and expire OTP null in the database
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.tokenVersion += 1;
        /// save the Changes to database 
        await user.save();

        return res.status(201).json({
            massage: "New password has been created"
        })
    }catch(err){
        console.error("You got some error On Password Reset", err);
        return res.status(500).json({
            message: "Internal server error!"
        })
    }
}
async function login(req, res){
    try{
        const {username, email, password} = req.body; /// get the data

        /// Normalize the given inputs. 
        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        /// Find the user and identify the user Exist or not? 
        const user = await userModel.findOne({
            $or:[
                {username: normalizedUsername},
                {email: normalizedEmail}
            ]
        })
        if(!user){ // If user doesn't exist 
            return res.status(400).json({
                message: "User doesn't exist in the database."
            })
        }

        /// is user varified? 
        const isUserVarified = user.isVerified;
        if(!isUserVarified){
            return res.status(403).json({
                message: "user is not varified :(",
                user: {
                    username: user.username,
                    email: user.email,
                    isVarified: user.isVerified
                }
            })
        }

        /// Verify the user inputs. 
        if(!password){
            return res.status(401).json({
                message: "Enter a password first"
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: "Invalid Password"
            })
        }

        /// save the token in user Cookie
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            username: user.username,
            tokenVersion: user.tokenVersion
        }, process.env.JWT_SECRET, {expiresIn: '33d'})

        res.cookie("token", token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2851200000 // 33 days :_)
        })

        return res.status(200).json({
            message: "Your successfully Login ::)",
            user: {
                username: user.username,
                email: user.email
            }
        })
    }catch(err){
        console.error("You Got error on Login: ", err);
        return res.status(500).json({
            message: "Internal server error."
        }) 
    }
}
async function logout(req, res){
    res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        }
    );
    return res.status(200).json({
        message: "You are successfully logout"
    })
}

module.exports = {
    signup,
    verify,
    resendOTP,
    sentOTP,
    forgotPassword,
    login,
    logout
} 