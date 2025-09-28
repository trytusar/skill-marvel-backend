// services/otpService.js
const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const client = null;

const sendOtp = async (phoneNumber, otp) => {
    try {
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const sendOtpWhatsapp = async (recipientPhoneNumber, verificationCode) => {
    try{
        const response = await axios.post('https://backend.textintime.com/api/message/sendOtpForGeeknomix', {
            phone: recipientPhoneNumber,
            otp: verificationCode
        });
        if(response.data){
            return true;
        }
        return false;
    }
    catch(err){
        console.error(err);
        return false;
    }
};

module.exports = { sendOtp, sendOtpWhatsapp };
