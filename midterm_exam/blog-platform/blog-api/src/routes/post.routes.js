const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Public routes
router.get('/posts', postController.getAllPosts);
router.get('/posts/:id', postController.getPostById);

// Protected routes
router.get('/me/posts', authenticate, postController.getMyPosts);
router.post('/posts', authenticate, authorize('author', 'admin'), postController.createPost);
router.put('/posts/:id', authenticate, postController.updatePost);
router.delete('/posts/:id', authenticate, authorize('admin'), postController.deletePost);

module.exports = router;
