import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getIo } from "../sockets/socket.js";
import { getSocketId } from "../sockets/socketManager.js";
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

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: text.trim(),
    seenBy: [req.user._id],
    replyTo: replyTo || null,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      populate: { path: "sender", select: "name" },
    });

  const io = getIo();

  io.to(conversationId).emit("receive-message", populatedMessage);

  const participants = conversation.participants;

  participants.forEach((userId) => {
    const socketId = getSocketId(userId);

    if (!socketId) return;

    io.to(socketId).emit("conversation-updated", {
      conversationId: conversation._id,

      lastMessage: populatedMessage,
    });
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

  for (const message of messages) {
    const currentUserId = req.user._id.toString();

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
    } else {
      const currentDeletedFor =
        message.deletedFor?.map((id) => id.toString()) || [];
      if (!currentDeletedFor.includes(currentUserId)) {
        currentDeletedFor.push(currentUserId);
      }
      message.deletedFor = currentDeletedFor;
      await message.save();

      // Notify only the user who deleted for themselves (to update their UI if they have multiple tabs/devices)
      const socketId = getSocketId(currentUserId);
      if (socketId) {
        io.to(socketId).emit("message-deleted", {
          messageId: message._id,
          conversationId: message.conversation,
          isDeletedForEveryone: false,
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
