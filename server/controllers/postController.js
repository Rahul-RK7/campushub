const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { content, type } = req.body;
    const postData = { author: req.user._id, content };
    if (req.user.role === 'faculty' && type === 'announcement') {
      postData.type = 'announcement';
    }
    const post = await Post.create(postData);
    await post.populate('author', 'name profilePic role');
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name profilePic role');
    res.json({ posts, page });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    const isOwner = post.author.toString() === req.user._id.toString();
    const isFaculty = req.user.role === 'faculty';
    if (!isOwner && !isFaculty) return res.status(403).json({ error: 'Not allowed' });
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    const userId = req.user._id;
    const alreadyLiked = post.likes.some(id => id.equals(userId));
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    const nowLiked = post.likes.some(id => id.equals(userId));
    res.json({ likes: post.likes.length, liked: nowLiked });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};