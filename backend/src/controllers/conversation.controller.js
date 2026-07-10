import Conversation from "../models/conversation.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/message.model.js";

export const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ApiError(400, "Receiver ID is required");
  }

  if (receiverId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot start a conversation with yourself");
  }

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: {
      $all: [req.user._id, receiverId],
    },
  });

  if (conversation) {
    return res
      .status(200)
      .json(new ApiResponse(200, conversation, "Conversation already exists"));
  }

  conversation = await Conversation.create({
    participants: [req.user._id, receiverId],
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, conversation, "Conversation created successfully"),
    );
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate({
      path: "participants",
      select: "name avatar status lastSeen",
    })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name",
      },
    })
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversations, "Conversations fetched successfully"),
    );
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate("participants", "name avatar")
    .populate("lastMessage");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant._id.toString() === req.user._id.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation fetched successfully"),
    );
});
