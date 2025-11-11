const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Technology' },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },   
  likedBy: { type: [String], default: [] }, // duplicate to keep consistency
  comments: { type: [commentSchema], default: [] },
  image: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
//done