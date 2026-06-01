const express = require('express');
const router  = express.Router();
const {
  getPartners, createPartner, updatePartner, deletePartner,
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getPartners)
  .post(protect, authorize('admin','superadmin'), createPartner);

router.route('/:id')
  .put(protect, authorize('admin','superadmin'), updatePartner)
  .delete(protect, authorize('admin','superadmin'), deletePartner);

module.exports = router;
