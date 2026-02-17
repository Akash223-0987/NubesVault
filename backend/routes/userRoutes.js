// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      return res.status(400).json({ 
        message: "Cannot change password for Google OAuth accounts" 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user preferences (placeholder for future implementation)
router.get("/preferences", async (req, res) => {
  try {
    // For now, return default preferences
    res.json({
      theme: "light",
      notifications: true,
      language: "en",
      storageLimit: 20 * 1024 * 1024 * 1024 // 20 GB
    });
  } catch (err) {
    console.error("Error fetching preferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user preferences (placeholder for future implementation)
router.put("/preferences", async (req, res) => {
  try {
    const { theme, notifications, language } = req.body;
    
    // For now, just acknowledge the update
    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: {
        theme,
        notifications,
        language
      }
    });
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user account
router.delete("/account", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
