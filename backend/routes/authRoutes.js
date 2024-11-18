const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUser, validateLogin } = require('../middleware/validateUser');
const upload = require('../config/multer');
const checkAuthentication = require('../middleware/checkAuth');

// Auth Routes
router.post('/register', validateUser, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/user', authController.checkUser);
router.get('/logout', authController.logout);
router.post('/uploadImage', checkAuthentication, upload.single('image'), authController.uploadImage);
router.get('/toggleDarkMode', checkAuthentication, authController.toggleDarkMode)
router.post('/toggleTheme', checkAuthentication, authController.toggleTheme)

module.exports = router;
