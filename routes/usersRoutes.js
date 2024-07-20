const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to get all users with 'user' role
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, 'firstName lastName email role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
