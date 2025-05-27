const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    
    if (req.userId === recipientId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Проверка, являются ли пользователи друзьями
    const isFriend = await Friend.findOne({
      $or: [
        { requester: req.userId, recipient: recipientId, status: 1 },
        { requester: recipientId, recipient: req.userId, status: 1 }
      ]
    });

    if (!isFriend && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'You can only message friends' });
    }

    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
    .populate('sender', 'username firstName lastName avatar')
    .populate('recipient', 'username firstName lastName avatar')
    .sort({ createdAt: 1 });

    // Помечаем сообщения как прочитанные
    await Message.updateMany(
      { sender: userId, recipient: req.userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    // Получаем список всех диалогов с последним сообщением
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(req.userId) },
            { recipient: mongoose.Types.ObjectId(req.userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(req.userId)] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$recipient", mongoose.Types.ObjectId(req.userId)] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          "user.password": 0,
          "user.__v": 0
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};