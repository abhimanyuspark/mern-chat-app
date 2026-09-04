import Conversation from "../models/conversation.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/message.model.js";
import { getIo } from "../sockets/socket.js";
import { getSocketId } from "../sockets/socketManager.js";

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

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
    });
  }

  const populatedConversation = await Conversation.findById(conversation._id).populate(
    "participants",
    "name avatar status lastSeen",
  );

  const io = getIo();
  const receiverSocketId = getSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("new-conversation", populatedConversation);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedConversation,
        "Conversation retrieved successfully",
      ),
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
    .sort({ updatedAt: -1 });

  const conversationsWithLastMessage = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({
        conversation: conversation._id,
        isDeleted: false,
        deletedFor: { $ne: req.user._id },
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name avatar");

      return {
        ...conversation.toObject(),
        lastMessage,
      };
    }),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversationsWithLastMessage,
        "Conversations fetched successfully",
      ),
    );
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate("participants", "name avatar")
    .populate("groupAdmins", "name avatar")
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

export const createGroup = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (!name || !participants || !Array.isArray(participants)) {
    throw new ApiError(400, "Group name and participants are required");
  }

  if (participants.length < 2) {
    throw new ApiError(400, "A group must have at least 2 other members");
  }

  // Add the current user to the participants list
  const allParticipants = [...new Set([...participants, req.user._id])];

  const conversation = await Conversation.create({
    groupName: name,
    participants: allParticipants,
    isGroup: true,
    groupAdmins: [req.user._id],
  });

  const fullConversation = await Conversation.findById(conversation._id).populate(
    "participants",
    "name avatar status lastSeen",
  );

  const io = getIo();
  allParticipants.forEach((participantId) => {
    const socketId = getSocketId(participantId);
    if (socketId) {
      io.to(socketId).emit("new-conversation", fullConversation);
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, fullConversation, "Group created successfully"));
});

export const updateGroupInfo = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { name, groupAvatar } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Group not found");
  }

  if (!conversation.isGroup) {
    throw new ApiError(400, "This is not a group conversation");
  }

  // Check if user is admin
  if (!conversation.groupAdmins.includes(req.user._id)) {
    throw new ApiError(403, "Only admins can update group info");
  }

  if (name) conversation.groupName = name;
  if (groupAvatar) conversation.groupAvatar = groupAvatar;

  await conversation.save();

  const updatedConversation = await Conversation.findById(conversationId)
    .populate("participants", "name avatar status lastSeen")
    .populate("groupAdmins", "name avatar");

  const io = getIo();
  updatedConversation.participants.forEach((participant) => {
    const socketId = getSocketId(participant._id);
    if (socketId) {
      io.to(socketId).emit("group-updated", updatedConversation);
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedConversation, "Group updated successfully"),
    );
});

export const addGroupMember = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { memberId } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Group not found");
  }

  if (!conversation.isGroup) {
    throw new ApiError(400, "This is not a group conversation");
  }

  // Check if user is admin
  if (!conversation.groupAdmins.includes(req.user._id)) {
    throw new ApiError(403, "Only admins can add members");
  }

  if (conversation.participants.includes(memberId)) {
    throw new ApiError(400, "User is already a member of this group");
  }

  conversation.participants.push(memberId);
  await conversation.save();

  const updatedConversation = await Conversation.findById(conversationId)
    .populate("participants", "name avatar status lastSeen")
    .populate("groupAdmins", "name avatar");

  const io = getIo();
  updatedConversation.participants.forEach((participant) => {
    const socketId = getSocketId(participant._id);
    if (socketId) {
      if (participant._id.toString() === memberId) {
        io.to(socketId).emit("new-conversation", updatedConversation);
      } else {
        io.to(socketId).emit("group-updated", updatedConversation);
      }
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedConversation, "Member added successfully"),
    );
});

export const removeGroupMember = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { memberId } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Group not found");
  }

  if (!conversation.isGroup) {
    throw new ApiError(400, "This is not a group conversation");
  }

  // Check if user is admin
  if (!conversation.groupAdmins.includes(req.user._id)) {
    throw new ApiError(403, "Only admins can remove members");
  }

  if (memberId === req.user._id.toString()) {
    throw new ApiError(
      400,
      "You cannot remove yourself. Use leave group instead",
    );
  }

  const oldParticipants = [...conversation.participants];
  conversation.participants = conversation.participants.filter(
    (p) => p.toString() !== memberId,
  );

  // Also remove from admins if they were one
  conversation.groupAdmins = conversation.groupAdmins.filter(
    (a) => a.toString() !== memberId,
  );

  await conversation.save();

  const updatedConversation = await Conversation.findById(conversationId)
    .populate("participants", "name avatar status lastSeen")
    .populate("groupAdmins", "name avatar");

  const io = getIo();
  oldParticipants.forEach((participantId) => {
    const socketId = getSocketId(participantId);
    if (socketId) {
      if (participantId.toString() === memberId) {
        io.to(socketId).emit("conversation-removed", conversationId);
      } else {
        io.to(socketId).emit("group-updated", updatedConversation);
      }
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedConversation, "Member removed successfully"),
    );
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Group not found");
  }

  if (!conversation.isGroup) {
    throw new ApiError(400, "This is not a group conversation");
  }

  const oldParticipants = [...conversation.participants];
  conversation.participants = conversation.participants.filter(
    (p) => p.toString() !== req.user._id.toString(),
  );

  // If user was an admin, remove them from admins
  conversation.groupAdmins = conversation.groupAdmins.filter(
    (a) => a.toString() !== req.user._id.toString(),
  );

  const io = getIo();

  // If no participants left, maybe delete the group or handle accordingly
  if (conversation.participants.length === 0) {
    await Conversation.findByIdAndDelete(conversationId);

    oldParticipants.forEach((participantId) => {
      const socketId = getSocketId(participantId);
      if (socketId) {
        io.to(socketId).emit("conversation-removed", conversationId);
      }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Group deleted as no members left"));
  }

  // If the admin left and there are no other admins, make someone else admin
  if (
    conversation.groupAdmins.length === 0 &&
    conversation.participants.length > 0
  ) {
    conversation.groupAdmins.push(conversation.participants[0]);
  }

  await conversation.save();

  const updatedConversation = await Conversation.findById(conversationId)
    .populate("participants", "name avatar status lastSeen")
    .populate("groupAdmins", "name avatar");

  oldParticipants.forEach((participantId) => {
    const socketId = getSocketId(participantId);
    if (socketId) {
      if (participantId.toString() === req.user._id.toString()) {
        io.to(socketId).emit("conversation-removed", conversationId);
      } else {
        io.to(socketId).emit("group-updated", updatedConversation);
      }
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Left group successfully"));
});
