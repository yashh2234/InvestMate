const nodemailer = require("nodemailer");
require('dotenv').config(); // Make sure .env variables are loaded

// Configure the Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your Gmail email
    pass: process.env.GMAIL_APP_PASS,   // your 16-character App Password
  },
});

// Function to send OTP/reset emails
async function sendOTPEmail(toEmail, otp) {
  try {
    await transporter.sendMail({
      from: `"Grip Invest" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Grip Invest Password Reset OTP",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error("Error sending email:", error.response || error.message);
  }
}

module.exports = { sendOTPEmail };
