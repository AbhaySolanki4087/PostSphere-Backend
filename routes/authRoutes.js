const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getProfile, updateProfile, deleteProfile } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);

module.exports = router;
// done
