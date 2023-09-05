// controllers/AuthController.js
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  static async getConnect(req, res) {
    const authHeaders = req.headers['authorization'];
    if (!authHeaders || !authHeaders.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCred = authHeaders.split(' ')[1];
    const crd = Buffer.from(encodedCred, 'base64').toString('utf-8');
    const [email, password] = crd.split(':');

    // Hash password using SHA1
    const hashedPwd = crypto.createHash('sha1').update(password).digest('hex');

    // Find user by email and hashed password
    const user = await dbClient.client.db().collection('users').findOne({ email, password: hashedPwd });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token
    const token = uuidv4();

    // Store the user ID in Redis with the token as the key for 24 hours
    await redisClient.client.setex(`auth_${token}`, 24 * 60 * 60, user._id.toString());

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Retrieve the user ID associated with the token from Redis
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.client.del(`auth_${token}`);

    return res.status(204).send();
  }
}

module.exports = AuthController;

