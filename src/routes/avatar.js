const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Avatar
 *   description: User avatar management
 */

/**
 * @swagger
 * /api/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Avatar]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: avatar
 *         type: file
 *         required: true
 *         description: The avatar image to upload
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Not authorized
 */
router.post('/', 
  authMiddleware,
  uploadMiddleware.single('avatar'),
  avatarController.uploadAvatar
);

/**
 * @swagger
 * /api/avatar/{userId}:
 *   get:
 *     summary: Get user avatar
 *     tags: [Avatar]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Avatar image file
 *       404:
 *         description: User or avatar not found
 */
router.get('/:userId', avatarController.getAvatar);

module.exports = router;