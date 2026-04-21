const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
router.use(protect);

router.post('/:postId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    const postExists = await Post.exists({ _id: req.params.postId });
    if (!postExists) return res.status(404).json({ error: 'Post not found' });
    if (!req.body.content?.trim()) return res.status(400).json({ error: 'Comment content is required' });

    const comment = await Comment.create({
      postId: req.params.postId,
      author: req.user._id,
      content: req.body.content
    });
    await Post.updateOne({ _id: req.params.postId }, { $inc: { commentCount: 1 } });
    await comment.populate('author', 'name profilePic');
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:postId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name profilePic');
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:postId/:commentId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.postId) || !mongoose.isValidObjectId(req.params.commentId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const c = await Comment.findById(req.params.commentId);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (c.postId.toString() !== req.params.postId) return res.status(400).json({ error: 'Comment does not belong to this post' });
    const isAuthor = c.author.toString() === req.user._id.toString();
    const isFaculty = req.user.role === 'faculty';
    if (!isAuthor && !isFaculty)
      return res.status(403).json({ error: 'Not allowed' });
    await c.deleteOne();
    await Post.updateOne({ _id: req.params.postId }, { $inc: { commentCount: -1 } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;