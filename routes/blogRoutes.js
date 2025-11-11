// routes/blogRoutes.js 
console.log("✅ blogRoutes loaded successfully"); 
const express = require('express'); 
const router = express.Router(); 
const multer = require('multer'); 
const fs = require('fs'); 
const path = require('path'); 
const Blog = require('../models/blogModel'); 
// const { isLoggedIn } = require('../middlewares/authMiddleware'); 
const isLoggedIn = require('../middlewares/authMiddleware');
// const { isLoggedIn } = require('../middlewares/uploadMiddleware');// Multer config 
console.log("isLoggedIn middleware type:", typeof isLoggedIn);

// ✅ Ensure uploads folder exists 
const uploadDir = path.join(__dirname, '../uploads'); 

if (!fs.existsSync(uploadDir)) { 
    fs.mkdirSync(uploadDir, { recursive: true }); 
    console.log("📂 'uploads' folder created automatically"); 
} 

// ✅ Multer setup for local image storage 
const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, uploadDir); 
    }, 
    filename: (req, file, cb) => { 
        cb(null, Date.now() + path.extname(file.originalname)); // e.g. 1731243276.jpg 
    }, 
}); 
const upload = multer({ storage }); 

// 🟢 Get all blogs 

router.get('/', async (req, res) => { 
    try { 
        const blogs = await Blog.find().sort({ createdAt: -1 }); 
        res.json({ success: true, blogs });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: 'Server error' }); 
    } 
}); 
// 🟢 Create new blog (with optional image) 

router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
    const { title, content, category } = req.body; 
    
// ✅ Always have a valid author 
const author = req.session?.user?.name || req.user?.name || "abhay"; 

if (!title || !content) { 
    return res.status(400).json({ 
        success: false, message: 'Title and content required' }); 
    } try { 
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
        const newBlog = await Blog.create({ title, 
            content, 
            category, 
            author, 
            image: imageUrl, 
        }); 
        console.log("File received:", req.file?.filename || "No image"); 
        console.log("Author:", author); 
        res.status(201).json({ success: true, blog: newBlog });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ success: false, message: 'Failed to create post' });
    } 
}); 

// for comments 
// Get all comments 

router.get('/:blogId/comments', async (req, res) => { 
    try { 
        const { blogId } = req.params; 
        const blog = await Blog.findById(blogId); 
        if (!blog) return res.status(404).json({ 
            msg: 'Blog not found' 
        }); 
        res.json({ 
            comments: blog.comments.reverse(), 
            count: blog.comments.length 
        }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } 
}); 

// add the Comments in Blogs 

router.post('/:blogId/comment', async (req, res) => { 
    try { 
        const { blogId } = req.params; 
        const { user, text } = req.body; 
        if (!user || !text) return res.status(400).json({ msg: 'User and text are required' }); 
        const blog = await Blog.findById(blogId); 
        if (!blog) return res.status(404).json({ msg: 'Blog not found' }); 
        blog.comments.push({ user, text }); 
        await blog.save(); 
        res.json({ comments: blog.comments.reverse(), count: blog.comments.length }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } 
}); 

//delete commenets from Blog 

router.delete('/:blogId/comment/:commentId', async (req, res) => { 
    try { 
        const { blogId, commentId } = req.params; 
        const blog = await Blog.findById(blogId); 
        if (!blog) return res.status(404).json({ msg: 'Blog not found' }); 
        // remove comment 
        blog.comments = blog.comments.filter( 
            (comment) => comment._id.toString() !== commentId 
        ); 
        await blog.save(); 
        res.json({ 
            comments: blog.comments.reverse(), 
            count: blog.comments.length 
        }); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    } 
}); 

// For likes // Like a blog 
router.post('/:blogId/like', isLoggedIn, async (req, res) => { 
    const { blogId } = req.params; 
    const username = req.session.user.name; // or req.user.name 
    const blog = await Blog.findById(blogId); 
    if (!blog) return res.status(404).json({ msg: 'Blog not found' }); 
    
    if (blog.likedBy.includes(username)) { 
        // Unlike 
        blog.likedBy = blog.likedBy.filter(u => u !== username); 
    } else { 
        // Like 
        blog.likedBy.push(username); 
    } 
    blog.likes = blog.likedBy.length; // update count 
    await blog.save(); 
    res.json({ success: true, likes: blog.likes, likedBy: blog.likedBy }); 
}); 
module.exports = router;