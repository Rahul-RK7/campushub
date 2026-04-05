const express = require('express');
const router = express.Router();
const { protect, facultyOnly } = require('../middleware/authMiddleware');
const { getPending, approve, reject } = require('../controllers/facultyController');
router.use(protect, facultyOnly);
router.get('/pending', getPending);
router.patch('/approve/:id', approve);
router.patch('/reject/:id', reject);
module.exports = router;