const express = require('express');
const router = express.Router();
const { checkEmail ,register,updatePassword, updateUsername, login } = require('../controllers/userController');

router.post('/check', checkEmail);
router.post('/register', register);
router.post('/updatePass', updatePassword);
router.post('/updateName', updateUsername);
router.post('/login', login);

module.exports = router;