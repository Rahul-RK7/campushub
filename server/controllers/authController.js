const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── Gmail SMTP transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, department, registrationId } = req.body;

    // Basic input validation
    if (!name || !email || !password || !registrationId) {
      return res.status(400).json({ error: 'Name, email, password, and registration ID are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already used
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const existingRegId = await User.findOne({ registrationId });
    if (existingRegId) return res.status(400).json({ error: 'Registration ID already in use' });

    // Hash password (never store plain text)
    const hashed = await bcrypt.hash(password, 10);

    // Create user with status: pending — explicitly set role to prevent escalation
    const user = await User.create({
      name, email, password: hashed, department, registrationId, role: 'student'
    });

    res.status(201).json({ message: 'Registration submitted. Awaiting faculty approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Block pending and rejected users
    if (user.status === 'pending')
      return res.status(403).json({ error: 'Account pending approval' });
    if (user.status === 'rejected')
      return res.status(403).json({ error: 'Account rejected' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token, user: {
        _id: user._id, name: user.name,
        email: user.email, role: user.role, status: user.status,
        profilePic: user.profilePic || '', department: user.department || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Forgot Password: send OTP to email ──
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    // Generate a 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHashed = await bcrypt.hash(otpPlain, 10);

    // Store hashed OTP with 10-minute expiry
    user.otp = otpHashed;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    await transporter.sendMail({
      from: `"CampusHUB" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'CampusHUB — Password Reset OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:2rem;border-radius:12px;background:#f8f7ff;">
          <h2 style="color:#3B309E;margin-bottom:0.5rem;">Password Reset</h2>
          <p style="color:#444;">Use the OTP below to reset your CampusHUB password. It expires in <strong>10 minutes</strong>.</p>
          <div style="text-align:center;margin:1.5rem 0;">
            <span style="display:inline-block;font-size:2rem;letter-spacing:0.5rem;font-weight:700;color:#3B309E;background:#ede9ff;padding:0.75rem 1.5rem;border-radius:8px;">${otpPlain}</span>
          </div>
          <p style="color:#888;font-size:0.8rem;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// ── Verify OTP ──
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user || !user.otp) return res.status(400).json({ error: 'No OTP request found' });

    // Check expiry
    if (user.otpExpiry < new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Compare OTP
    const match = await bcrypt.compare(otp, user.otp);
    if (!match) return res.status(400).json({ error: 'Invalid OTP' });

    // Clear OTP after successful verification to prevent reuse
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate a short-lived reset token (5 minutes)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ message: 'OTP verified', resetToken });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Reset Password ──
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ error: 'Email, new password, and reset token are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Reset session expired. Please start over.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    const user = await User.findOne({ email, _id: decoded.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update password and clear OTP fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
