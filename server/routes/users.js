const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateMe } = require('../controllers/userController');

router.use(protect);
router.get('/me', getMe);
router.patch('/me', updateMe);

module.exports = router;
