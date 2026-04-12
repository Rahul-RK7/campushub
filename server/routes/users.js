const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateMe, getPostCount, toggleFollow, getMyPosts, getUserProfile } = require('../controllers/userController');
const { upload } = require('../config/cloudinaryConfig');

router.use(protect);

// "me" routes MUST come before ":id" routes
router.get('/me', getMe);
router.get('/me/post-count', getPostCount);
router.get('/me/posts', getMyPosts);
router.patch('/me', upload.single('profilePic'), updateMe);

// Other-user routes
router.get('/:id', getUserProfile);
router.post('/:id/follow', toggleFollow);

module.exports = router;
