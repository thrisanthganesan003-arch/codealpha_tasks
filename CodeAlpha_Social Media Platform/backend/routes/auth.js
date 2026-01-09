const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, name, bio } = req.body;
        
        // Validate input
        if (!username || !email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
            if (user) return res.status(400).json({ error: 'User already exists' });
            
            try {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                // Create user
                db.run('INSERT INTO users (username, email, password, name, bio, avatar) VALUES (?, ?, ?, ?, ?, ?)',
                    [username, email, hashedPassword, name, bio, 'default-avatar.png'],
                    function(err) {
                        if (err) return res.status(500).json({ error: 'Failed to create user: ' + err.message });
                        
                        const token = jwt.sign({ id: this.lastID }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
                        res.json({ token, user: { id: this.lastID, username, email, name, bio } });
                    });
            } catch (hashErr) {
                res.status(500).json({ error: 'Password hashing failed: ' + hashErr.message });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        
        try {
            const validPass = await bcrypt.compare(password, user.password);
            if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });
            
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email, 
                    name: user.name, 
                    bio: user.bio,
                    avatar: user.avatar
                } 
            });
        } catch (err) {
            res.status(500).json({ error: 'Authentication error: ' + err.message });
        }
    });
});

module.exports = router;

router.get('/me', auth, (req, res) => {
    const userId = req.user.id;
    db.get('SELECT id, username, email, name, bio, avatar FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});
module.exports = router;