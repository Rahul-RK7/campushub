const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected'],
    default: 'pending'      // ← Every new student starts here
  },
  department: String,
  registrationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: '' }
}, { timestamps: true });   // adds createdAt and updatedAt automatically

module.exports = mongoose.model('User', userSchema);