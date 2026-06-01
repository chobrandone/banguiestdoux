const express = require('express');
const router  = express.Router();
const {
  getTalents, getTalent, createTalent, updateTalent, deleteTalent,
} = require('../controllers/talentController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getTalents)
  .post(protect, authorize('admin','superadmin'), createTalent);

router.route('/:slug')
  .get(getTalent)
  .put(protect, authorize('admin','superadmin'), updateTalent)
  .delete(protect, authorize('admin','superadmin'), deleteTalent);

module.exports = router;
