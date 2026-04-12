const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: 500,
    default: ''
  },
  type: {
    type: String,
    enum: ['post', 'announcement'],
    default: 'post'
  },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  mediaType: {
    type: String,
    enum: ['none', 'image', 'video'],
    default: 'none'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// At least content or media must be present
postSchema.pre('validate', function () {
  if (!this.content && this.mediaType === 'none') {
    throw new Error('Post must have text content or media');
  }
});

module.exports = mongoose.model('Post', postSchema);