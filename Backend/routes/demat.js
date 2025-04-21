const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { createDemat, getMyDemat } = require('../controllers/dematController');

router.post('/create', auth, createDemat);
router.get('/me', auth, getMyDemat);

module.exports = router;