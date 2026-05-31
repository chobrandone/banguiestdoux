const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const {
  register, login, getMe, updateProfile, updatePassword, logout, getUsers,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
], register);

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me',     protect, getMe);
router.put('/profile',  protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/users', protect, authorize('admin', 'superadmin'), getUsers);

module.exports = router;
