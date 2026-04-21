const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createStory, getStories } = require('../controllers/storyController');
const { upload } = require('../config/cloudinaryConfig');

router.use(protect);

const handleUpload = (req, res, next) => {
    upload.single('media')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        next();
    });
};

const enforceMediaLimits = (req, res, next) => {
    if (!req.file) return res.status(400).json({ error: 'No media file provided' });
    const isVideo = req.file.mimetype.startsWith('video/');
    const maxBytes = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (req.file.size > maxBytes) {
        const limitMB = isVideo ? 25 : 5;
        return res.status(413).json({ error: `File too large. Max ${limitMB} MB for ${isVideo ? 'videos' : 'images'}.` });
    }
    next();
};

router.post('/', handleUpload, enforceMediaLimits, createStory);
router.get('/', getStories);

module.exports = router;
