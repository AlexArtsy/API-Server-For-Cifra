const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management endpoints
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts
 *       401:
 *         description: Not authorized
 */
router.get('/', authMiddleware, postController.getAllPosts);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's posts
 *       401:
 *         description: Not authorized
 */
router.get('/user/:userId', authMiddleware, postController.getUserPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post data
 *       404:
 *         description: Post not found
 */
router.get('/:id', authMiddleware, postController.getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authMiddleware,
  [
    check('content', 'Content is required').not().isEmpty(),
    check('content', 'Content must be less than 2000 characters').isLength({ max: 2000 })
  ],
  postController.createPost
);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 */
router.put('/:id', authMiddleware, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *       403:
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authMiddleware, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/rate:
 *   post:
 *     summary: Rate post (0-5)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating added
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Post not found
 */
router.post('/:id/rate', authMiddleware, postController.ratePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like/unlike post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like status toggled
 *       404:
 *         description: Post not found
 */
router.post('/:id/like', authMiddleware, postController.likePost);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add comment to post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Validation error
 *       404:
 *         description: Post not found
 */
router.post(
  '/:id/comments',
  authMiddleware,
  [
    check('content', 'Content is required').not().isEmpty(),
    check('content', 'Content must be less than 1000 characters').isLength({ max: 1000 })
  ],
  postController.addComment
);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get post comments
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Post not found
 */
router.get('/:id/comments', authMiddleware, postController.getPostComments);

module.exports = router;