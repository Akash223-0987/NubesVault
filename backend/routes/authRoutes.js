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

const axios = require("axios");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY`,
      { email, password, returnSecureToken: true }
    );

    res.status(200).json({
      token: response.data.idToken,
      uid: response.data.localId,
      email: response.data.email
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials" });
  }
});


router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



module.exports = router;
