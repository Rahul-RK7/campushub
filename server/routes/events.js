const express = require('express');
const router = express.Router();
const { protect, facultyOnly } = require('../middleware/authMiddleware');
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', protect, getEvents);
router.post('/', protect, facultyOnly, createEvent);
router.delete('/:id', protect, facultyOnly, deleteEvent);

module.exports = router;
