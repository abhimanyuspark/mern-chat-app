import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;

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
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name avatar",
  );

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
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages.reverse(), "Messages fetched successfully"),
    );
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  await message.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted successfully"));
});
