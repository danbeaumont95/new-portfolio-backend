const express = require('express');
require('dotenv').config();
const emailController = require('../controllers/email.controller');

const router = express.Router();

router.post('/sendEmailToDan', emailController.postEmailToDan);
router.post('/mailingListEmail', emailController.postEmailToAllOnMailingList);

module.exports = router;