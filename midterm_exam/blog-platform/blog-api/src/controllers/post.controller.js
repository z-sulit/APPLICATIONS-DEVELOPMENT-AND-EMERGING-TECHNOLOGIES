const PostModel = require('../models/post.model'); //import PostModel

// databse read
exports.getAllPosts = (req, res, next) => {
  try {
    const posts = PostModel.findAll();
    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

exports.getPostById = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

// extracts input and prevents users from submitting empty posts
exports.createPost = (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content || !String(title).trim() || !String(content).trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }


// creates new post with user_id, title, and content.
    const newPost = PostModel.create({
      user_id: req.user.id,
      title: String(title).trim(),
      content: String(content).trim(),
    });

    return res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};


// checks if post exists and if user is owner or admin before allowing update.
exports.updatePost = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ownership or admin override
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: you do not own this post' });
    }

    const { title, content } = req.body;

    if (!title || !content || !String(title).trim() || !String(content).trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const updatedPost = PostModel.update(id, {
      title: String(title).trim(),
      content: String(content).trim(),
    });

    return res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    PostModel.delete(id);
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMyPosts = (req, res, next) => {
  try {
    const posts = PostModel.findByUserId(req.user.id);
    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};
