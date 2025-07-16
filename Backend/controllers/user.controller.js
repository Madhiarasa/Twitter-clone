import Notification from "../Models/notificationmodel.js";
import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary"

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in profile getting:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};


export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });

      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
       const newNotification = new Notification({
            type:"follow",
            from:req.user._id,
            to:userToModify._id
        })
        await newNotification.save();
      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnFollowUser:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id.toString())
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      user.password = null;
    });

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    let { username, fullName, email, currentPassword, newPassword, bio, link, profileImg, coverImg } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Both current and new password are required" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        const oldPublicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldPublicId);
      }
      const uploaded = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploaded.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const oldPublicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(oldPublicId);
      }
      const uploaded = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploaded.secure_url;
    }

    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();

    user.password = null;
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in updateUser:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};
