
import Users from '../models/User.js'; // Import the User model (database model for users)
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import otpGenerator from 'otp-generator'; // Import otp-generator for generating OTPs
import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Configure dotenv

import { TokenService } from '../services/TokenService.js'; // Import the TokenService class
const tokenService = new TokenService(); // Create an instance of the TokenService class

// ***************************for user login********************************
export const login = async (req, res) => {
    const { email, password } = req.body; // Get the email and password from the request body

    // Check if email and password are provided
    if (!email || email.trim() === "" || !password || password.trim() === "") {
      return res.status(422).json({ message: "Please enter both email and password" });
    }
    
    // Find the user with the provided email
    try {
      const existingUser = await Users.findOne({ email }); // Find the user by email  
    if (!existingUser) {
      return res.status(404).json({ message: "Unable to find user from this email" }); // Return error if user is not found
    }
  
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password); // Compare the password
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" }); // Return error if password is incorrect
    }
    
    // ********** Violates the OCP principle as If you later decide to use a different token format or signing mechanism (e.g., OAuth, custom encryption), you would need to modify the login function. Instead, use a Token Service. ************
    // Generate a token
    // const token = jwt.sign({ id: existingUser._id }, 'USERSECRETKEY', { expiresIn: "7d" }); // Sign the token with the user ID and secret key
    // return res.status(200).json({
    //   message: "Login success",
    //   userId: existingUser._id,
    //   token, // Return the token to the client
    // });
    // ********** Violates the OCP principle as If you later decide to use a different token format or signing mechanism (e.g., OAuth, custom encryption), you would need to modify the login function. Instead, use a Token Service. ************

    // ********Refactored code using TokenService********
    const token = tokenService.generateToken({ id: existingUser._id }, 'USERSECRETKEY', "7d");
    return res.status(200).json({
      message: "Login success",
      userId: existingUser._id,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
 
// ***************** To send OTP for email verification ********************
export const sendOtp = async (req, res) => {
  const { email } = req.body; // Get the email from the request body

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true, // Only digits will be included in the OTP
      upperCaseAlphabets: false, // No uppercase letters will be included
      specialChars: false, // No special characters will be included
    });
    const otpExpiry = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes expiry

    // Update or create user with OTP details
    const user = await Users.findOneAndUpdate(
      { email }, // Find the user by email
      // Update the user with the OTP and expiry and set isVerified to false
      {
        otp,
        otpExpiry,
        isVerified: false,
      },
      // Options for findOneAndUpdate
      {
        new: true,
        upsert: true, // Create the user if it doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    // If user is not found or created, return error
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_ID, // nodemailer email ID
        pass: process.env.EMAIL_PASS, // nodemailer email password
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
    await transporter.sendMail(mailOptions); // Send the email

    res.status(200).json({ // Return success message
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) { // Catch any errors
    console.error("Error sending OTP:", error);
    if (!res.headersSent) { // If headers have not been sent
      res.status(500).json({
        success: false,
        message: "Error sending OTP",
      });
    }
  }
};


//   ***********************Verify OTP************************
export const verifyOtp = async (req, res) => { // Verify OTP
  const { email, otp, username, password } = req.body; // Get email, OTP, username, and password from the request body

  if (!email || !otp) { // Check if email and OTP are provided
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

    if (!user) { // If user is not found 
      return res.status(404).json({ // Return error
        success: false,
        message: "User not found or OTP expired",
      });
    }

    // Check if the provided OTP matches
    if (user.otp !== otp) { // If OTP does not match
      return res.status(400).json({ // Return error
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP is valid; update user fields and save
    user.isVerified = true; // Set isVerified to true
    user.otp = null;  // Clear the OTP
    user.otpExpiry = null; // Clear the OTP expiry

    // If username and password are provided, set them
    if (username && password) { 
      user.username = username; // Set the username
      user.password = bcrypt.hashSync(password, 10); // Hash the password
    }

    await user.save(); // Save the updated user

    res.status(200).json({ // Return success
      success: true,
      message: "OTP verified successfully", 
      isVerified: true,
    });
  } catch (error) { // Catch any errors
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
    });
  }
};
