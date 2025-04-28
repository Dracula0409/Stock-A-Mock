const express = require('express');
const router = express.Router();
const { checkEmail ,register,updatePassword, login } = require('../controllers/userController');

router.post('/check', checkEmail);
router.post('/register', register);
router.post('/updatePass', updatePassword);
router.post('/login', login);

module.exports = router;