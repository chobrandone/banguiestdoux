const express = require('express');
const router  = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, rsvpEvent } = require('../controllers/eventController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.route('/')
  .get(optionalAuth, getEvents)
  .post(protect, authorize('admin','superadmin'), createEvent);

router.route('/:slug')
  .get(getEvent)
  .put(protect, authorize('admin','superadmin'), updateEvent)
  .delete(protect, authorize('admin','superadmin'), deleteEvent);

router.post('/:id/rsvp', protect, rsvpEvent);

module.exports = router;
