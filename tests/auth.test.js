import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { login, sendOtp, verifyOtp } from '../controllers/auth-controller.js';
import Users from '../models/User.js';
import nodemailer from 'nodemailer';

// Mock dependencies
jest.mock('../models/User.js');
jest.mock('bcryptjs');
jest.mock('nodemailer');
jest.mock('otp-generator');

describe('Authentication Controller Tests', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should return 422 if email or password is missing', async () => {
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please enter both email and password"
      });
    });

    test('should return 404 if user not found', async () => {
      req.body = { email: 'test@test.com', password: 'password' };
      Users.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unable to find user from this email"
      });
    });

    test('should return 400 if password is incorrect', async () => {
      req.body = { email: 'test@test.com', password: 'wrong' };
      Users.findOne.mockResolvedValue({ 
        _id: 'userId',
        password: 'hashedPassword' 
      });
      bcrypt.compareSync.mockReturnValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials"
      });
    });

    test('should return 200 and token on successful login', async () => {
      req.body = { email: 'test@test.com', password: 'correct' };
      Users.findOne.mockResolvedValue({ 
        _id: 'userId',
        password: 'hashedPassword' 
      });
      bcrypt.compareSync.mockReturnValue(true);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login success",
          userId: 'userId',
          token: expect.any(String)
        })
      );
    });
  });

  describe('sendOtp', () => {
    test('should send OTP successfully', async () => {
      req.body = { email: 'test@test.com' };
      
      const mockUser = {
        email: 'test@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Users.findOneAndUpdate.mockResolvedValue(mockUser);
      
      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true)
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "OTP sent successfully"
      });
    });
  });
});
