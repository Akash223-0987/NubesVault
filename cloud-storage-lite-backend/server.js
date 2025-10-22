// require("dotenv").config();
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/auth");
require("./passportConfig"); // 👈 Google OAuth config file

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:3000"], // your React/frontend origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sessions for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Routes
app.use("/auth", authRoutes);

// ✅ Upload setup
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Protected: Upload File
app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded successfully!",
    file: req.file.filename,
  });
});

// ✅ Protected: List Files
app.get("/files", authMiddleware, (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.json(files);
});

// ✅ Protected: Delete File
app.delete("/delete/:filename", authMiddleware, (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// ✅ Protected: Download File
// =====================
// Protected Download
// =====================
app.get("/download/:filename", authMiddleware, (req, res, next) => {
  try {
    let decodedToken = null;

    // 1️⃣ Try header first
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    }
    // 2️⃣ Try query string
    else if (req.query.token) {
      decodedToken = jwt.verify(req.query.token, process.env.JWT_SECRET);
    }

    if (!decodedToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const encodedFilename = req.params.filename;
    const decodedFilename = decodeURIComponent(encodedFilename);
    const filePath = path.join(UPLOAD_DIR, decodedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const originalName = decodedFilename.split("-").slice(1).join("-");
    res.setHeader("Content-Disposition", `attachment; filename="${originalName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ✅ Google OAuth Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard", // redirect to your cloud UI
    failureRedirect: "http://localhost:3000/login",
  })
);

// ✅ Logout
app.get("/auth/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
