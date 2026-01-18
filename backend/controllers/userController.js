import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user avatar
// @route   PUT /api/users/me/avatar
// @access  Private
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please upload an image file");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Upload to Cloudinary (if configured)
    let avatarUrl;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "chat-app/avatars",
          transformation: [
            { width: 200, height: 200, crop: "fill" },
            { quality: "auto" },
          ],
        });

        avatarUrl = result.secure_url;

        // Delete local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // Fallback to local file if Cloudinary fails
        console.error("Cloudinary upload failed:", uploadError);
        avatarUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      // Use local file URL
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({
      success: true,
      data: {
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Remove user avatar (set to default)
// @route   DELETE /api/users/me/avatar
// @access  Private
export const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Set to default avatar
    user.avatarUrl = user.getDefaultAvatar();
    await user.save();

    res.json({
      success: true,
      data: {
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=searchterm
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .select("name email avatarUrl isOnline lastSeen")
      .limit(20);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
