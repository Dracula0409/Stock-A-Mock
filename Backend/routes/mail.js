const express = require('express');
const router = express.Router();

const { sendEmail, signupEmail } = require('../controllers/mailController');

router.post('/sendEmail', async (req, res) => {
    try {
        const response = await sendEmail(req.body);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/signupEmail', async (req, res) => {
    try {
        const response = await signupEmail(req.body);
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;