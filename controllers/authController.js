const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Blog = require('../models/blogModel');

// 🧠 Register Controller
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🧠 Login Controller
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // ✅ Save session
    req.session.user = { id: user._id, name: user.name, email: user.email };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: req.session.user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🧠 Update Controller

exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  // Get logged-in user's email from session 
  const email = req.session.user?.email; // using cookie session

  if (!email) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },             // find user by email
      { $set: { name, bio } }, // update fields you want
      { new: true }           // return the updated document
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// 🧠 Logout Controller
exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

// 🧠 Profile Controller
exports.getProfile = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// routes/authRoutes.js
// controllers/authController.js
// dlete all recprd to dleted user
exports.deleteProfile = async (req, res) => {
  try {
      const userName = req.session.user.name;

      // 1️⃣ Delete user account
      await User.findByIdAndDelete(req.session.user.id);

      // 2️⃣ Remove all comments and likes by this user from blogs
      await Blog.updateMany(
        {},
        {
          $pull: { comments: { user: userName }, likedBy: userName }
        }
      );

      // 3️⃣ Update likes count based on new likedBy array
      const blogs = await Blog.find({ likedBy: { $exists: true } });
      for (const blog of blogs) {
        blog.likes = blog.likedBy.length;
        await blog.save();
      }

      // 4️⃣ Destroy session & clear cookie
      req.session.destroy(err => { if(err) console.error(err); });
      res.clearCookie('connect.sid');

      res.json({ success: true, message: 'Account deleted and related comments/likes removed' });

  } catch (err) {
    console.error('Delete profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

