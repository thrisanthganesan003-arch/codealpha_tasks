// Debug script - test if server starts
console.log('Starting debug...');

try {
    console.log('Loading express...');
    const express = require('express');
    console.log('✓ Express loaded');

    console.log('Loading cors...');
    const cors = require('cors');
    console.log('✓ CORS loaded');

    console.log('Loading path...');
    const path = require('path');
    console.log('✓ Path loaded');

    console.log('Loading express-fileupload...');
    const fileUpload = require('express-fileupload');
    console.log('✓ Express-fileupload loaded');

    console.log('Loading dotenv...');
    require('dotenv').config();
    console.log('✓ Dotenv loaded');

    console.log('Creating app...');
    const app = express();
    console.log('✓ App created');

    console.log('Setting up middleware...');
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(__dirname, 'temp')
    }));
    console.log('✓ Middleware set up');

    console.log('Loading routes...');
    const authRoutes = require('./routes/auth');
    console.log('✓ Auth routes loaded');
    
    const userRoutes = require('./routes/users');
    console.log('✓ User routes loaded');
    
    const postRoutes = require('./routes/posts');
    console.log('✓ Post routes loaded');

    console.log('Setting up route handlers...');
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/posts', postRoutes);
    console.log('✓ Routes set up');

    console.log('Starting server...');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });

} catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
