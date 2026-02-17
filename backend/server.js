const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
require("./passportConfig");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
    if (err.message.includes("ETIMEDOUT") || err.message.includes("ENOTFOUND")) {
      console.error("Check your internet connection and MONGO_URI in .env");
    }
  });

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded successfully!",
    file: req.file.filename,
  });
});

app.get("/files", authMiddleware, (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.json(files);
});

app.delete("/delete/:filename", authMiddleware, (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

app.get("/download/:filename", authMiddleware, (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, decodedFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  const originalName = decodedFilename.split("-").slice(1).join("-");
  res.setHeader("Content-Disposition", `attachment; filename=\"${originalName}\"`);
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => res.status(500).end());
  stream.pipe(res);
});

app.get("/view/:filename", authMiddleware, (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, decodedFilename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Determine content type based on extension
  const ext = path.extname(decodedFilename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.json': 'application/json',
    '.html': 'text/html'
  };

  if (mimeTypes[ext]) {
    contentType = mimeTypes[ext];
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${decodedFilename}"`);
  
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.status(500).end());
  stream.pipe(res);
});



app.get("/usage", authMiddleware, (req, res) => {
  let totalSize = 0;
  try {
    if (fs.existsSync(UPLOAD_DIR)) {
      const files = fs.readdirSync(UPLOAD_DIR);
      files.forEach(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        }
      });
    }
  } catch (err) {
    console.error("Error calculating storage:", err);
    return res.status(500).json({ error: "Failed to calculate storage" });
  }

  // Define a storage limit (e.g., 1 GB)
  const limit = 20 * 1024 * 1024 * 1024; // 1 GB in bytes

  res.json({
    used: totalSize,
    limit: limit
  });
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
