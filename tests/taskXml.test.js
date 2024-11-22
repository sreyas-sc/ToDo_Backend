import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import taskXmlrouter from '../routes/taskXMLRoutes.js';
import TaskXML from '../models/TaskXML.js';

// Mock TaskXML model
jest.mock('../models/TaskXML.js');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/task-xml', taskXmlrouter);

describe('Task XML Routes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /task-xml/save-xml', () => {
    test('should save new XML data successfully', async () => {
      const mockData = {
        userId: 'testUserId',
        xmlData: '<tasks><task>Test Task</task></tasks>'
      };

      TaskXML.findOne.mockResolvedValue(null);
      TaskXML.create.mockResolvedValue(mockData);

      const response = await request(app)
        .post('/task-xml/save-xml')
        .send(mockData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'XML data saved successfully'
      });
      expect(TaskXML.create).toHaveBeenCalledWith(mockData);
    });

    test('should update existing XML data successfully', async () => {
      const mockData = {
        userId: 'testUserId',
        xmlData: '<tasks><task>Updated Task</task></tasks>'
      };

      const mockExisting = {
        userId: 'testUserId',
        xmlData: '<tasks><task>Old Task</task></tasks>',
        save: jest.fn().mockResolvedValue(true)
      };

      TaskXML.findOne.mockResolvedValue(mockExisting);

      const response = await request(app)
        .post('/task-xml/save-xml')
        .send(mockData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'XML data saved successfully'
      });
      expect(mockExisting.save).toHaveBeenCalled();
    });
  });

  describe('GET /task-xml/get-xml/:userId', () => {
    test('should retrieve XML data successfully', async () => {
      const mockData = {
        userId: 'testUserId',
        xmlData: '<tasks><task>Test Task</task></tasks>'
      };

      TaskXML.findOne.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/task-xml/get-xml/testUserId');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        xmlData: mockData.xmlData
      });
    });

    test('should return 404 if no data found', async () => {
      TaskXML.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/task-xml/get-xml/nonexistentUser');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'No data found for this user'
      });
    });
  });
});