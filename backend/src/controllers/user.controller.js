import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const users = await User.find({
    _id: { $ne: req.user._id },
  })
    .select("-password -refreshToken")
    .skip((page - 1) * limit)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json(new ApiResponse(200, []));
  }

  const users = await User.find({
    _id: { $ne: req.user._id },

    $or: [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        email: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  }).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, users, "Users found"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

export const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    throw new ApiError(400, "FCM token is required");
  }

  // Remove the token if it already exists to avoid duplicates with different timestamps
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { fcmTokens: { token: fcmToken } },
  });

  // Add the token to the array
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        fcmTokens: {
          token: fcmToken,
          device: "android",
          createdAt: new Date(),
        },
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "FCM token updated successfully"));
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id.toString();

  if (userId === currentUserId) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const userToBlock = await User.findById(userId);
  if (!userToBlock) {
    throw new ApiError(404, "User not found");
  }

  const currentUser = await User.findById(currentUserId);
  const isCurrentlyBlocked = currentUser.blockedUsers?.some(
    (id) => id.toString() === userId,
  );

  if (isCurrentlyBlocked) {
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (id) => id.toString() !== userId,
    );
  } else {
    currentUser.blockedUsers.push(userId);
  }

  await currentUser.save();

  const updatedUser = await User.findById(currentUserId).select(
    "-password -refreshToken",
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isBlocked: !isCurrentlyBlocked,
        blockedUsers: updatedUser.blockedUsers,
      },
      !isCurrentlyBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
    ),
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }
    if (name.trim().length < 3 || name.trim().length > 50) {
      throw new ApiError(400, "Name must be between 3 and 50 characters");
    }
    user.name = name.trim();
  }

  if (bio !== undefined) {
    user.bio = bio.trim();
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await user.save();

  const updatedUser = await User.findById(userId).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

