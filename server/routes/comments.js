const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
router.use(protect);

router.post('/', async (req, res) => {
  const comment = await Comment.create({
    postId: req.params.postId,
    author: req.user._id,
    content: req.body.content
  });
  await comment.populate('author', 'name profilePic');
  res.status(201).json({ comment });
});

router.get('/', async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId })
    .sort({ createdAt: 1 })
    .populate('author', 'name profilePic');
  res.json({ comments });
});

router.delete('/:commentId', async (req, res) => {
  const c = await Comment.findById(req.params.commentId);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (c.author.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not allowed' });
  await c.deleteOne();
  res.json({ message: 'Deleted' });
});
module.exports = router;