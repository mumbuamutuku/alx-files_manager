// controllers/UsersController.js
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const crypto = require('crypto');


class UsersControllers {
    static async postNew(req, res) {
        // Get user data from the request body
        const { email, password } = req.body;
    
        // Check for missing email or password
        if (!email) {
          return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
          return res.status(400).json({ error: 'Missing password' });
        }
    
        // Check if the email already exists in the database
        const usersCount = await dbClient.nbUsers();
        const existingUser = await dbClient.client.db().collection('users').findOne({ email });
    
        if (existingUser) {
          return res.status(400).json({ error: 'Already exists' });
        }
    
        // Hash the password using SHA1
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    
        // Create a new user object
        const newUser = {
          email,
          password: hashedPassword,
          id: uuidv4(), // Generate a new UUID for the user
        };
    
        // Insert the new user into the database
        const result = await dbClient.client.db().collection('users').insertOne(newUser);
    
        // Check if the insertion was successful
        if (result.insertedCount === 1) {
          return res.status(201).json({ id: newUser.id, email: newUser.email });
        } else {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    }
    
module.exports = UsersController;