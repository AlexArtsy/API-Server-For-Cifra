const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const post = new Post({
      author: req.userId,
      content
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Проверка прав на обновление
    if (post.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.content = content || post.content;
    post.updatedAt = new Date();

    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Проверка прав на удаление
    if (post.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.remove();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.ratePost = async (req, res, next) => {
  try {
    const { value } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Проверка, оценивал ли пользователь уже этот пост
    const existingRatingIndex = post.ratings.findIndex(
      rating => rating.user.toString() === req.userId
    );

    if (existingRatingIndex !== -1) {
      post.ratings[existingRatingIndex].value = value;
    } else {
      post.ratings.push({ user: req.userId, value });
    }

    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.userId);
    
    if (likeIndex === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: post._id,
      author: req.userId,
      content
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};