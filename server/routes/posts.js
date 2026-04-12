const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPost, getFeed, deletePost, toggleLike, getUserPosts } = require('../controllers/postController');
const { upload } = require('../config/cloudinaryConfig');

router.use(protect);
router.get('/', getFeed);

// Wrap multer to catch Cloudinary/upload errors gracefully
const handleUpload = (req, res, next) => {
    upload.single('media')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            const message = err.message || 'File upload failed';
            return res.status(400).json({ error: message });
        }
        next();
    });
};

// File size enforcement middleware (runs AFTER multer)
const enforceMediaLimits = (req, res, next) => {
    if (!req.file) return next();
    const isVideo = req.file.mimetype.startsWith('video/');
    const maxBytes = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (req.file.size > maxBytes) {
        const limitMB = isVideo ? 25 : 5;
        return res.status(413).json({ error: `File too large. Max ${limitMB} MB for ${isVideo ? 'videos' : 'images'}.` });
    }
    next();
};

router.post('/', handleUpload, enforceMediaLimits, createPost);
router.get('/user/:userId', getUserPosts);
router.delete('/:id', deletePost);
router.patch('/:id/like', toggleLike);
module.exports = router;