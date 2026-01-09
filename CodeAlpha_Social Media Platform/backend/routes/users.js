const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Get all users
router.get('/', auth, (req, res) => {
    db.all(`
        SELECT users.id, users.name, users.username, users.avatar, users.bio,
        (SELECT COUNT(*) FROM followers WHERE following_id = users.id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = users.id) as following_count,
        EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = users.id) as is_following
        FROM users
        ORDER BY (SELECT COUNT(*) FROM followers WHERE following_id = users.id) DESC
    `, [req.user.id], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(users);
    });
});

// Get user profile
router.get('/:username', auth, (req, res) => {
    db.get(`
        SELECT users.*,
        (SELECT COUNT(*) FROM followers WHERE following_id = users.id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = users.id) as following_count,
        EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = users.id) as is_following
        FROM users WHERE username = ?
    `, [req.user.id, req.params.username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// Follow/unfollow user
router.post('/:id/follow', auth, (req, res) => {
    const followingId = req.params.id;
    const followerId = req.user.id;
    
    if (followingId == followerId) return res.status(400).json({ error: 'Cannot follow yourself' });
    
    db.get('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', 
        [followerId, followingId], (err, follow) => {
        if (follow) {
            // Unfollow
            db.run('DELETE FROM followers WHERE id = ?', [follow.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: false });
            });
        } else {
            // Follow
            db.run('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', 
                [followerId, followingId], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ following: true });
                });
        }
    });
});

// Get user posts
router.get('/:id/posts', auth, (req, res) => {
    db.all(`
        SELECT posts.*, users.username, users.name, users.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = posts.id AND user_id = ?) as liked
        FROM posts 
        JOIN users ON posts.user_id = users.id
        WHERE posts.user_id = ?
        ORDER BY posts.created_at DESC
    `, [req.user.id, req.params.id], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});


// Update current user's avatar (base64 image)
router.put('/avatar', auth, (req, res) => {
    const userId = req.user.id;
    const { image, remove } = req.body; // expect data URL / base64 string or remove flag

    if (remove) {
        db.run('UPDATE users SET avatar = NULL WHERE id = ?', [userId], function(err) {
            if (err) {
                console.error('DB error clearing avatar:', err.message);
                return res.status(500).json({ error: err.message });
            }
            db.get('SELECT id, name, username, avatar, bio FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, user });
            });
        });
        return;
    }

    if (!image) return res.status(400).json({ error: 'No image provided' });
    // Basic sanity checks
    try {
        if (typeof image !== 'string' || !image.startsWith('data:')) {
            return res.status(400).json({ error: 'Image must be a data URL' });
        }
        // Log minimal info for debugging
        console.log(`[avatar upload] user=${userId} length=${image.length} prefix=${image.slice(0,30)}`);
    } catch (e) {
        console.error('Error validating image:', e.message);
        return res.status(400).json({ error: 'Invalid image' });
    }

    db.run('UPDATE users SET avatar = ? WHERE id = ?', [image, userId], function(err) {
        if (err) {
            console.error('DB error updating avatar:', err.message);
            return res.status(500).json({ error: err.message });
        }

        db.get('SELECT id, name, username, avatar, bio FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                console.error('DB error fetching user after avatar update:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, user });
        });
    });
});

module.exports = router;