import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

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

  // Use $addToSet to prevent duplicate tokens in the array
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
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

