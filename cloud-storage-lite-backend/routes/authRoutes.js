// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/google-login", async (req, res) => {
  try {
    const { name, email, googleId } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || "Google User", email, googleId });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Google login server error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
