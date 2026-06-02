const express = require('express');
const router  = express.Router();
const { createMessage, getMessages, markRead, deleteMessage } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createMessage);
router.get('/', protect, authorize('admin','superadmin'), getMessages);
router.put('/:id/read', protect, authorize('admin','superadmin'), markRead);
router.delete('/:id', protect, authorize('admin','superadmin'), deleteMessage);

module.exports = router;
