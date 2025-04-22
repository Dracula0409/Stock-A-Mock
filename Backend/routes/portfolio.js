const express = require('express');
const router = express.Router();
const {getPortfolio} = require('../controllers/portfolioController');

router.get('/:userId', getPortfolio);

module.exports = router;