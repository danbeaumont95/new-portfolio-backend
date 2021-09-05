const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const userController = require('../controllers/users.controller');
require('dotenv').config();

const router = express.Router();
router.options('/login', cors());

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/allUsersOnML', userController.getAllUsersOnMailingList);

module.exports = router;