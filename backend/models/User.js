// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // empty for Google login
  googleId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
