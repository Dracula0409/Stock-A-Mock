const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { transact, getPortfolio, getCAGR } = require('../controllers/transactionController');

//router.post('/', auth, transact);
router.get('/portfolio', auth, getPortfolio);
router.get('/cagr', auth, getCAGR);

module.exports = router;