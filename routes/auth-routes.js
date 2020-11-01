const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');
const OTP = require('../models/otp');
const currentUser = require('../middlewares/current-user');
const requireAuth = require('../middlewares/require-auth');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(KEYS.sendGridKey);

const bcrypt = require('bcrypt');
const router = express.Router();

async function sendOtp(otp,email) {
    const msg = { 
        to: email,
        from: 'goyalaadesh462@gmail.com',
        subject: 'Email Verification',
        text: 'Your OTP for Verification',
        html: '<h2>'+ otp +'</h2>'
    }
    sgMail.send(msg).then(() => {
        console.log('Email Sent');
    }).catch(err => {
        console.log(err);
    });
}

router.post('/api/users/signup', async (req, res) => {
    const { email, password } = req.body;

    try {

        const existingUser = await User.findOne({ email: email});
        if(existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            email: email,
            password: hashedPassword
        });
        await newUser.save();
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        console.log(randomNumber);
        const newOtp = new OTP({
            otp: randomNumber,
            verfyingEmail: newUser.email
        });
        newOtp.save();
        console.log(newOtp);
        await sendOtp(newOtp.otp,newUser.email);
        res.send({success:true, otp: newOtp, email: newUser.email, user: newUser , message: 'Otp send on email successfully'});

    }catch(err) {
        console.error(err);
        throw new Error(err);
    }

});

router.post('/api/users/verify',async (req, res) => {
    const { otp, email } = req.body;
    try {
        const existingUser = await User.findOne({ email : email});
        const existingOtp = await OTP.findOne({verfyingEmail : email});
        if(!existingOtp) {
            throw new Error('Otp not found');
        }
        if(!existingUser){
            throw new Error('User not found');
        }
        if(existingOtp.otp == otp) {
            existingUser.isVerified = true;
            await existingUser.save();
            console.log('User Verification Complete');
            await OTP.deleteOne({verifyingEmail : email});
            res.send({existingUser});
        }else{
            res.send('Otp verification failed');
        }
    }catch(err) {
        throw new Error(err);
    }
});

router.post('/api/users/signin', async (req, res) => {
    const {email , password} = req.body;
    const existingUser = await User.findOne({email : email});
    if(!existingUser) {
        res.send('User with this email does not exist');
    }
    const passwordMatch = await bcrypt.compare(password,existingUser.password);
    if(!passwordMatch){
        res.send('Credentials does not match');
    }
    if(!existingUser.isVerified) {
        res.send({success: false, email: existingUser.email, message: 'User not verified'});
    }
    const userJwt = await jwt.sign({id : existingUser.id}, KEYS.jwtSecret );
    req.session = {
        jwt: userJwt
    };
    return res.status(200).send(existingUser);
});

router.get('/api/users/logout', async (req,res) => {
    req.session = null;
    res.send({});
});

router.get('/api/current_user', currentUser , requireAuth , async (req, res) => {
    const user = await User.findById(req.currentUser.id);
    res.send(user);
});

module.exports = router;