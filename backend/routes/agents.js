const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {getAllAgents, createAgent, deleteAgent, updateAgent} = require("../controllers/agent.controller")
router.get('/', authenticate, authorizeAdmin, getAllAgents);

router.post('/', [
  authenticate,
  authorizeAdmin,
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('mobileNumber').notEmpty(),
  body('countryCode').notEmpty()
], createAgent);

router.put('/:id', [
  authenticate,
  authorizeAdmin,
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('mobileNumber').optional(),
  body('countryCode').optional()
], updateAgent);

router.delete('/:id', authenticate, authorizeAdmin, deleteAgent);

module.exports = router;
