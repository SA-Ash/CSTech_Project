const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/multer');
const { uploadLeads, getAllLeads, getLeedsByAgent } = require('../controllers/leads.controller');


router.post('/upload', authenticate, authorizeAdmin, upload.single('file'), uploadLeads);

router.get('/', authenticate, authorizeAdmin, getAllLeads);

router.get('/by-agent', authenticate, authorizeAdmin, getLeedsByAgent);

module.exports = router;
