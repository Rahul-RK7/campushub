const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  const post = await Post.create({ author: req.user._id, content: req.body.content });
  await post.populate('author', 'name profilePic role');
  res.status(201).json({ post });
};

exports.getFeed = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name profilePic role');
  res.json({ posts, page });
};

exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const isOwner = post.author.toString() === req.user._id.toString();
  const isFaculty = req.user.role === 'faculty';
  if (!isOwner && !isFaculty) return res.status(403).json({ error: 'Not allowed' });
  await post.deleteOne();
  res.json({ message: 'Deleted' });
};

exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.user._id;
  if (post.likes.includes(userId)) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  res.json({ likes: post.likes.length, liked: post.likes.includes(userId) });
}