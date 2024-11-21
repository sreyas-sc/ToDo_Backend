import express from "express";
import { sendOtp, verifyOtp, login } from "../controllers/auth-controller.js"; // Make sure to import verifyOtp properly
import { verifyUserToken } from "../middlewares/auth.js"; 

const authRouter = express.Router();

// Login
authRouter.post("/login", login); 

// Send OTP
authRouter.post("/send-otp", sendOtp); 

// Verify OTP
authRouter.post("/verify-otp", verifyOtp);


export default authRouter;
