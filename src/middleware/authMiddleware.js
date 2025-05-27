const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Получаем токен из заголовка Authorization
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Требуется авторизация: токен отсутствует или в неверном формате',
        error: 'MISSING_OR_INVALID_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1]; // Берем часть после "Bearer "

    // 2. Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Проверяем наличие userId в токене
    if (!decoded.userId) {
      return res.status(401).json({
        message: 'Неверная структура токена: отсутствует userId',
        error: 'INVALID_TOKEN_STRUCTURE'
      });
    }

    // 4. Ищем пользователя в базе
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
        error: 'USER_NOT_FOUND'
      });
    }

    // 5. Добавляем данные пользователя в объект запроса
    req.user = user;
    req.userId = user._id; // ObjectId
    req.userRole = user.role;

    next(); // Пропускаем запрос дальше
  } catch (err) {
    // Обработка ошибок верификации токена
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Срок действия токена истек',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Неверный токен',
        error: 'INVALID_TOKEN'
      });
    }

    // Все остальные ошибки
    console.error('Auth middleware error:', err);
    res.status(500).json({ 
      message: 'Ошибка сервера при авторизации',
      error: 'SERVER_ERROR'
    });
  }
};