const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Create post
router.post('/', auth, (req, res) => {
    const { content, image } = req.body;
    const userId = req.user.id;
    
    db.run('INSERT INTO posts (user_id, content, image, created_at) VALUES (?, ?, ?, datetime("now"))',
        [userId, content, image || null],
        function(err) {
            if (err) {
                console.error('Error creating post:', err);
                return res.status(500).json({ error: err.message });
            }
            
            db.get('SELECT posts.*, users.username, users.name, users.avatar FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?', 
                [this.lastID], (err, post) => {
                    if (err) {
                        console.error('Error fetching created post:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Post created successfully:', post);
                    res.json(post);
                });
        });
});

// Get all posts
router.get('/', (req, res) => {
    db.all(`
        SELECT posts.*, users.username, users.name, users.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments_count
        FROM posts 
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    `, [], (err, posts) => {
        if (err) {
            console.error('Error loading posts:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Loaded posts:', posts);
        res.json(posts);
    });
});

// Like/unlike post
router.post('/:id/like', auth, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    
    db.get('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId], (err, like) => {
        if (like) {
            // Unlike
            db.run('DELETE FROM likes WHERE id = ?', [like.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: false });
            });
        } else {
            // Like
            db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: true });
            });
        }
    });
});

// Add comment
router.post('/:id/comments', auth, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    db.run('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, datetime("now"))',
        [postId, userId, content],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT comments.*, users.username, users.name, users.avatar FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?',
                [this.lastID], (err, comment) => {
                    res.json(comment);
                });
        });
});

// Get comments for post
router.get('/:id/comments', auth, (req, res) => {
    db.all(`
        SELECT comments.*, users.username, users.name, users.avatar 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE post_id = ? 
        ORDER BY created_at ASC
    `, [req.params.id], (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comments);
    });
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the comment
    db.get('SELECT * FROM comments WHERE id = ?', [commentId], (err, comment) => {
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
        
        db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Delete post
router.delete('/:id', auth, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Check if user owns the post
    db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
        
        // Delete associated likes and comments first
        db.run('DELETE FROM likes WHERE post_id = ?', [postId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.run('DELETE FROM comments WHERE post_id = ?', [postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            });
        });
    });
});

// Update post
router.put('/:id', auth, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
    }
    
    // Check if user owns the post
    db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });
        
        db.run('UPDATE posts SET content = ? WHERE id = ?', [content, postId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get('SELECT posts.*, users.username, users.name, users.avatar FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?', 
                [postId], (err, post) => {
                    res.json(post);
                });
        });
    });
});

module.exports = router;