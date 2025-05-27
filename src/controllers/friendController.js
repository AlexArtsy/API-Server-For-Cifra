const Friend = require('../models/Friend');
const User = require('../models/User');

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    
    if (req.userId === recipientId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Проверка на существующий запрос
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: req.userId, recipient: recipientId },
        { requester: recipientId, recipient: req.userId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new Friend({
      requester: req.userId,
      recipient: recipientId,
      status: 0
    });

    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

exports.respondToFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 1 = accept, 2 = reject
    
    const friendRequest = await Friend.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Проверка прав на ответ
    if (friendRequest.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = status;
    await friendRequest.save();

    res.json(friendRequest);
  } catch (error) {
    next(error);
  }
};

exports.getFriendRequests = async (req, res, next) => {
  try {
    const requests = await Friend.find({
      $or: [
        { requester: req.userId, status: 0 },
        { recipient: req.userId, status: 0 }
      ]
    })
    .populate('requester', 'username firstName lastName avatar')
    .populate('recipient', 'username firstName lastName avatar');

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requester: req.userId, status: 1 },
        { recipient: req.userId, status: 1 }
      ]
    })
    .populate('requester', 'username firstName lastName avatar')
    .populate('recipient', 'username firstName lastName avatar');

    // Формируем список друзей (исключая текущего пользователя)
    const friendList = friends.map(friend => 
      friend.requester._id.toString() === req.userId 
        ? friend.recipient 
        : friend.requester
    );

    res.json(friendList);
  } catch (error) {
    next(error);
  }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    
    const friendship = await Friend.findOne({
      $or: [
        { requester: req.userId, recipient: friendId },
        { requester: friendId, recipient: req.userId }
      ],
      status: 1
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    await friendship.remove();
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    next(error);
  }
};