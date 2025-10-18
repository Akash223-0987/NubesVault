const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors()); // allow frontend to call backend
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Serve static files (optional)
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

// List files
app.get("/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.json(files);
});

// Delete file
app.delete("/delete/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// ✅ Fixed Download route - handles URL encoded filenames
app.get("/download/:filename", (req, res) => {
  // Decode the filename to handle spaces and special characters
  const encodedFilename = req.params.filename;
  const decodedFilename = decodeURIComponent(encodedFilename);
  
  const filePath = path.join(UPLOAD_DIR, decodedFilename);
  
  console.log("Download request:", {
    encoded: encodedFilename,
    decoded: decodedFilename,
    fileExists: fs.existsSync(filePath)
  });
  
  if (fs.existsSync(filePath)) {
    // Get original filename for download (without timestamp)
    const originalName = decodedFilename.split('-').slice(1).join('-');
    
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } else {
    console.log("File not found at path:", filePath);
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => console.log(`Server running at http://127.0.0.1:${PORT}`));
