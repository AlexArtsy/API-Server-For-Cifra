const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1, 2], // 0 = pending, 1 = accepted, 2 = rejected
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Уникальный индекс для предотвращения дублирования запросов
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);