const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const login = require('../controllers/auth.controller');

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

module.exports = router;
