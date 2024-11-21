
import jwt from 'jsonwebtoken'; // Import the JWT library

export class TokenService { // Create a class for the TokenService
  generateToken(payload, secretKey, expiresIn) { // Create a method to generate tokens
    return jwt.sign(payload, secretKey, { expiresIn }); // Return the generated token
  }
}