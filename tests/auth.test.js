const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('POST /auth/login', () => {
  it('should return a token and userId on successful login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
  });

  it('should return an error for invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
