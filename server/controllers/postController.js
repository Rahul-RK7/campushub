const Post = require('../models/Post');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinaryConfig');

exports.createPost = async (req, res) => {
  try {
    const { content, type } = req.body;
    const postData = { author: req.user._id, content: content || '' };

    if (req.user.role === 'faculty' && type === 'announcement') {
      postData.type = 'announcement';
    }

    // Handle uploaded media — upload buffer to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      postData.mediaUrl = result.secure_url;
      postData.mediaPublicId = result.public_id;
      postData.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    // Validate at least content or media
    if (!postData.content && !req.file) {
      return res.status(400).json({ error: 'Post must have text or media' });
    }

    const post = await Post.create(postData);
    await post.populate('author', 'name profilePic role');
    res.status(201).json({ post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
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

    // Delete media from Cloudinary if present
    if (post.mediaPublicId) {
      try {
        const resourceType = post.mediaType === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(post.mediaPublicId, { resource_type: resourceType });
      } catch (cloudErr) {
        console.error('Cloudinary delete error (non-fatal):', cloudErr);
      }
    } else if (post.mediaUrl) {
      // Fallback for legacy posts without public_id
      try {
        const urlParts = post.mediaUrl.split('/');
        const folderAndFile = urlParts.slice(urlParts.indexOf('campushub_posts')).join('/');
        const publicId = folderAndFile.replace(/\.[^.]+$/, '');
        const resourceType = post.mediaType === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cloudErr) {
        console.error('Cloudinary legacy delete error (non-fatal):', cloudErr);
      }
    }

    const Comment = require('../models/Comment');
    await Comment.deleteMany({ postId: post._id });
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