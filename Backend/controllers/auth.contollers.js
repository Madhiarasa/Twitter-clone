// controllers/auth.controller.js
import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import generaterToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingUser || existingUsername) {
      return res.status(400).json({ error: "Email or username already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword
    });

    await newUser.save();

    generaterToken(newUser._id, res);

    return res.status(200).json({
      message: "User created",
      user: {
        _id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        link: newUser.link
      }
    });
  } catch (error) {
    console.log(`Error in signup: ${error}`);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: "Incorrect password" });

    generaterToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe:", error.message);
    res.status(500).json({ error: "Internal error" });
  }
};
