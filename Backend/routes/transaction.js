const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/buy', transactionController.buyStock);
router.post('/sell', transactionController.sellStock);

module.exports = router;