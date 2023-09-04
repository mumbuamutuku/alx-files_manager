// routes/index.js
const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

// Define routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

//UserController routes
router.post('/users', UsersController.postNew);

//authentication endpoints
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

module.exports = router;
