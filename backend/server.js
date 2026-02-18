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
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
  });

app.use("/auth", authRoutes);
app.use("/user", authMiddleware, userRoutes);

const UPLOAD_ROOT = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT);

// Helper to get user-specific upload directory
const getUserAndDir = (req) => {
  // authMiddleware sets req.userId (JWT)
  // passport sets req.user (Session)
  const userId = req.userId || (req.user ? req.user.id : null);
  if (!userId) throw new Error("User not authenticated");
  
  const userDir = path.join(UPLOAD_ROOT, userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return { userId, userDir };
};

app.use("/uploads", (req, res, next) => {
  // Protect static uploads if needed, or implement specific view logic.
  // For now, we rely on the specific routes below for secure access.
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { userDir } = getUserAndDir(req);
      cb(null, userDir);
    } catch (err) {
      cb(err);
    }
  },
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
  try {
    const { userDir } = getUserAndDir(req);
    const files = fs.readdirSync(userDir);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.json([]); // Return empty if user dir doesn't exist or error
  }
});

app.delete("/delete/:filename", authMiddleware, (req, res) => {
  try {
    const { userDir } = getUserAndDir(req);
    const filePath = path.join(userDir, req.params.filename);
    
    // Security check: prevent directory traversal
    if (!filePath.startsWith(userDir)) {
       return res.status(403).json({ success: false, message: "Invalid filepath" });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "File deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/download/:filename", authMiddleware, (req, res) => {
  try {
    const { userDir } = getUserAndDir(req);
    const decodedFilename = decodeURIComponent(req.params.filename);
    const filePath = path.join(userDir, decodedFilename);

    if (!filePath.startsWith(userDir)) {
       return res.status(403).json({ error: "Access denied" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const originalName = decodedFilename.split("-").slice(1).join("-");
    res.setHeader("Content-Disposition", `attachment; filename=\"${originalName}\"`);
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/view/:filename", authMiddleware, (req, res) => {
  try {
    const { userDir } = getUserAndDir(req);
    const decodedFilename = decodeURIComponent(req.params.filename);
    const filePath = path.join(userDir, decodedFilename);
    
    if (!filePath.startsWith(userDir)) {
       return res.status(403).json({ error: "Access denied" });
    }

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
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/usage", authMiddleware, (req, res) => {
  try {
    const { userDir } = getUserAndDir(req);
    let totalSize = 0;
    
    if (fs.existsSync(userDir)) {
      const files = fs.readdirSync(userDir);
      files.forEach(file => {
        const filePath = path.join(userDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        }
      });
    }

    // Define a storage limit (e.g., 1 GB)
    const limit = 20 * 1024 * 1024 * 1024; // 20 GB in bytes

    res.json({
      used: totalSize,
      limit: limit
    });
  } catch (err) {
    console.error("Error calculating storage:", err);
    return res.status(500).json({ error: "Failed to calculate storage" });
  }
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
