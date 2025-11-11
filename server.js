	//server.js
	require('dotenv').config(); 
	const express = require('express'); 
	const mongoose = require('mongoose'); 
	const cors = require('cors'); 
	const session = require('express-session'); 
	const cookieParser = require('cookie-parser'); 
	const authRoutes = require('./routes/authRoutes'); 
	const blogRoutes = require('./routes/blogRoutes'); 
	// ✅ Added 
	const path = require('path'); 
	const app = express(); 
	app.use(cors({ 
		origin: 'http://localhost:3000', 
		// React app 
		credentials: true, 
	})); 
	app.use(express.json()); 
	app.use(cookieParser()); 
	// Serve uploaded images publicly 
	app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
	app.use(session({ 
		secret: 'mysecretkey', 
		resave: false, 
		saveUninitialized: false, 
		cookie: { 
			httpOnly: true, 
			maxAge: 24 * 60 * 60 * 1000 
		} 
	})); 
	// 👇 Add this line 
	mongoose.connect(process.env.MONGO_URI) 
	.then(() => console.log('MongoDB connected')) 
	.catch(err => console.error('MongoDB error:', err)); 

	app.use('/api', authRoutes);
	 
	app.use('/api/blogs', blogRoutes); 
	app.listen(5000, () => { 
		console.log('Server running on http://localhost:5000'); 
	});