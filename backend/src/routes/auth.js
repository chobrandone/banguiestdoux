const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, updateProfile, updatePassword, logout, getUsers, updateUserRole,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, updateProfile);
router.put('/password',  protect, updatePassword);
router.get('/users',     protect, authorize('admin', 'superadmin'), getUsers);
router.put('/users/:id/role', protect, authorize('superadmin'), updateUserRole);

module.exports = router;
