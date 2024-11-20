import Users from '../models/User.js'; // Ensure this import is correct
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv'; // Commonly used
dotenv.config(); 



// for user login
export const login = async (req, res, next) => {
  console.log("Login request received");
    const { email, password } = req.body;
  
    if (!email || email.trim() === "" || !password || password.trim() === "") {
      return res.status(422).json({ message: "Please enter both email and password" });
    }
  
    let existingUser;
    try {
      existingUser = await Users.findOne({ email }); // Use `Users` instead of `users`
    } catch (err) {
      return console.log(err);
    }
  
    if (!existingUser) {
      return res.status(404).json({ message: "Unable to find user from this email" });
    }
  
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  
    // Generate a token
    const token = jwt.sign({ id: existingUser._id }, 'USERSECRETKEY', { expiresIn: "7d" });
    return res.status(200).json({
      message: "Login success",
      userId: existingUser._id,
      token, // Return the token to the client
    });
  };

  
//   
// ***************** To send OTP for email verification ********************
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiry = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes expiry

    // Update or create user with OTP details
    const user = await Users.findOneAndUpdate(
      { email }, // Find the user by email
      {
        otp,
        otpExpiry,
        isVerified: false,
      },
      {
        new: true,
        upsert: true, // Create the user if it doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "OTP FOR LOGIN",
      text: `Hi,\n\nPlease use the following OTP to verify your login:\n\nOTP: ${otp}`,
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error sending OTP",
      });
    }
  }
};



  
//   Veerify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp, username, password } = req.body;

  if (!email || !otp) {
    return res.status(422).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  try {
    // Find the user with the matching email and non-expired OTP
    const user = await Users.findOne({
      email,
      otpExpiry: { $gt: new Date() }, // OTP should not have expired
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or OTP expired",
      });
    }

    // Check if the provided OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid; update user fields and save
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    // If username and password are provided, set them
    if (username && password) {
      user.username = username;
      user.password = bcrypt.hashSync(password, 10); // Hash the password
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      isVerified: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
    });
  }
};
