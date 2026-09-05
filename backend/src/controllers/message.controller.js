import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIo } from "../sockets/socket.js";
import { getSocketId } from "../sockets/socketManager.js";
import { sendPushNotification } from "../utils/notification.utils.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, replyTo } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  if (!text?.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (
    !conversation.participants.some(
      (id) => id.toString() === req.user._id.toString(),
    )
  ) {
    throw new ApiError(403, "Access denied");
  }

  // Block checks for 1-on-1 conversations
  if (!conversation.isGroup) {
    const recipientId = conversation.participants.find(
      (id) => id.toString() !== req.user._id.toString(),
    );

    if (recipientId) {
      const recipient = await User.findById(recipientId);

      if (
        req.user.blockedUsers?.some(
          (id) => id.toString() === recipientId.toString(),
        )
      ) {
        throw new ApiError(
          400,
          "You have blocked this user. Unblock to send messages.",
        );
      }

      if (
        recipient?.blockedUsers?.some(
          (id) => id.toString() === req.user._id.toString(),
        )
      ) {
        throw new ApiError(400, "You cannot send messages to this user.");
      }
    }
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: text.trim(),
    seenBy: [req.user._id],
    replyTo: replyTo || null,
  });

  conversation.lastMessage = message._id;
  conversation.deletedBy = [];
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "name" },
    });

  const io = getIo();

  // Emit to the conversation room for real-time updates
  io.to(conversationId).emit("receive-message", populatedMessage);

  const participants = conversation.participants;

  // Notify participants
  participants.forEach((userId) => {
    const userIdStr = userId.toString();
    const socketId = getSocketId(userIdStr);

    // Emit conversation-updated via socket if connected
    if (socketId) {
      io.to(socketId).emit("conversation-updated", {
        conversationId: conversation._id,
        lastMessage: populatedMessage,
      });
    }

    // Always try to send push notification if not the sender
    // This ensures notifications arrive even if socket is "connected" but app is in background
    if (userIdStr !== req.user._id.toString()) {
      User.findById(userIdStr).then((user) => {
        if (user && user.fcmTokens && user.fcmTokens.length > 0) {
          const tokens = user.fcmTokens.map((t) => t.token);
          sendPushNotification(
            tokens,
            populatedMessage.sender.name,
            populatedMessage.text,
            {
              conversationId: conversation._id.toString(),
              senderId: populatedMessage.sender._id.toString(),
            },
          );
        }
      });
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, populatedMessage, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const messages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "name" },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const visibleMessages = messages.filter(
    (message) =>
      !message.deletedFor?.some(
        (id) => id.toString() === req.user._id.toString(),
      ),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        visibleMessages.reverse(),
        "Messages fetched successfully",
      ),
    );
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const rawIds = req.body.ids ?? req.query.ids ?? req.params.id;
  const mode = req.body.mode ?? req.query.mode ?? "me";

  const ids = Array.isArray(rawIds)
    ? rawIds
    : typeof rawIds === "string"
      ? rawIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

  if (ids.length === 0) {
    throw new ApiError(400, "Message ID(s) are required");
  }

  const messages = await Message.find({ _id: { $in: ids } });

  if (messages.length !== ids.length) {
    throw new ApiError(404, "One or more messages not found");
  }

  if (mode === "everyone") {
    const unauthorizedMessages = messages.filter(
      (message) => message.sender.toString() !== req.user._id.toString(),
    );

    if (unauthorizedMessages.length > 0) {
      throw new ApiError(
        403,
        "You can only delete your own messages for everyone",
      );
    }
  }

  const io = getIo();
  const currentUserId = req.user._id.toString();
  const conversationsToUpdate = new Set();

  for (const message of messages) {
    if (mode === "everyone") {
      message.isDeleted = true;
      message.text = "This message was deleted";
      message.image = "";
      message.file = "";
      await message.save();

      io.to(message.conversation.toString()).emit("message-deleted", {
        messageId: message._id,
        conversationId: message.conversation,
        isDeletedForEveryone: true,
        text: "This message was deleted",
      });

      conversationsToUpdate.add(message.conversation.toString());
    } else {
      const currentDeletedFor =
        message.deletedFor?.map((id) => id.toString()) || [];
      if (!currentDeletedFor.includes(currentUserId)) {
        currentDeletedFor.push(currentUserId);
      }
      message.deletedFor = currentDeletedFor;
      await message.save();

      // Notify only the user who deleted for themselves
      const socketId = getSocketId(currentUserId);
      if (socketId) {
        io.to(socketId).emit("message-deleted", {
          messageId: message._id,
          conversationId: message.conversation,
          isDeletedForEveryone: false,
        });
      }
      conversationsToUpdate.add(message.conversation.toString());
    }
  }

  // Update last messages for affected conversations
  for (const convId of conversationsToUpdate) {
    const conversation = await Conversation.findById(convId);
    if (!conversation) continue;

    if (mode === "everyone") {
      const lastMsg = await Message.findOne({
        conversation: convId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name avatar");

      // Update the conversation's lastMessage reference if it pointed to a deleted message
      const currentLastMsgId = conversation.lastMessage?.toString();
      const isCurrentLastMsgDeleted = messages.some(
        (m) => m._id.toString() === currentLastMsgId,
      );

      if (isCurrentLastMsgDeleted) {
        conversation.lastMessage = lastMsg ? lastMsg._id : null;
        await conversation.save();
      }

      // Notify all participants about the new preview
      conversation.participants.forEach((userId) => {
        const socketId = getSocketId(userId);
        if (socketId) {
          io.to(socketId).emit("conversation-updated", {
            conversationId: conversation._id,
            lastMessage: lastMsg,
          });
        }
      });
    } else {
      // mode === "me"
      const lastMsgForUser = await Message.findOne({
        conversation: convId,
        isDeleted: false,
        deletedFor: { $ne: currentUserId },
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name avatar");

      const socketId = getSocketId(currentUserId);
      if (socketId) {
        io.to(socketId).emit("conversation-updated", {
          conversationId: conversation._id,
          lastMessage: lastMsgForUser,
        });
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedIds: ids, mode },
      messages.length > 1
        ? "Messages deleted successfully"
        : "Message deleted successfully",
    ),
  );
});

export const clearChat = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id.toString();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Find all messages in this conversation
  const messages = await Message.find({ conversation: conversationId });

  for (const message of messages) {
    const currentDeletedFor =
      message.deletedFor?.map((id) => id.toString()) || [];
    if (!currentDeletedFor.includes(userId)) {
      currentDeletedFor.push(userId);
      message.deletedFor = currentDeletedFor;
      await message.save();
    }
  }

  // Update conversation's lastMessage reference if needed
  if (conversation.lastMessage) {
    const lastMsgForUser = await Message.findOne({
      conversation: conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    }).sort({ createdAt: -1 });

    if (!lastMsgForUser) {
      conversation.lastMessage = null;
      await conversation.save();
    }
  }

  // Notify the user via socket that this conversation's messages were cleared
  const io = getIo();
  const socketId = getSocketId(userId);
  if (socketId) {
    io.to(socketId).emit("conversation-updated", {
      conversationId: conversation._id,
      lastMessage: null,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { conversationId }, "Chat cleared successfully"));
});
