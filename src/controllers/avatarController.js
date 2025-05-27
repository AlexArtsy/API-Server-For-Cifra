const User = require('../models/User');
const path = require('path');
const fs = require('fs-extra');

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      // Удаляем загруженный файл, если пользователь не найден
      await fs.unlink(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Удаляем старый аватар, если он существует
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      const oldAvatarPath = path.join(__dirname, '../../uploads', user.avatar);
      if (await fs.pathExists(oldAvatarPath)) {
        await fs.unlink(oldAvatarPath);
      }
    }

    // Обновляем аватар пользователя
    user.avatar = req.file.filename;
    await user.save();

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    // Удаляем загруженный файл в случае ошибки
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error(err));
    }
    next(error);
  }
};

exports.getAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let avatarPath;
    if (user.avatar === 'default-avatar.jpg') {
      // Возвращаем дефолтный аватар
      avatarPath = path.join(__dirname, '../../public/default-avatar.jpg');
    } else {
      avatarPath = path.join(__dirname, '../../uploads', user.avatar);
    }

    // Проверяем существование файла
    if (!await fs.pathExists(avatarPath)) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    res.sendFile(avatarPath);
  } catch (error) {
    next(error);
  }
};