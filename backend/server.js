const express = require("express");
// const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// ✅ Enable CORS for all routes
const cors = require("cors");
app.use(cors()); // enable CORS for all routes

app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// ✅ Serve uploads as static (optional, not used for download)
app.use("/uploads", express.static(UPLOAD_DIR));

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded successfully!",
    file: req.file.filename,
  });
});

// ✅ List files
// ✅ List files
app.get("/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  console.log("Files in uploads folder:", files); // Add this line
  res.json(files);
});

// ✅ Delete file
app.delete("/delete/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// ✅ Download route with CORS
// ✅ Download route - FIXED VERSION
// ✅ Fixed Download route
app.get("/download/:filename", (req, res) => {
  try {
    // Decode the filename to handle spaces and special characters
    const encodedFilename = req.params.filename;
    const decodedFilename = decodeURIComponent(encodedFilename);
    
    const filePath = path.join(UPLOAD_DIR, decodedFilename);
    
    console.log("Download attempt:", {
      encoded: encodedFilename,
      decoded: decodedFilename,
      filePath: filePath,
      fileExists: fs.existsSync(filePath)
    });
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log("❌ File not found:", filePath);
      return res.status(404).json({ error: "File not found" });
    }
    
    // Get file stats
    const fileStats = fs.statSync(filePath);
    console.log("File stats:", {
      size: fileStats.size,
      isFile: fileStats.isFile()
    });
    
    // Get original filename for download (without timestamp)
    const originalName = decodedFilename.split('-').slice(1).join('-');
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Error streaming file' });
    });
    
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
 