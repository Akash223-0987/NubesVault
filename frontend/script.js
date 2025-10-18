const API_URL = "http://127.0.0.1:5000";

// =====================
// File Uploader
// =====================
function FileUploader({ onUploadComplete }) {
  const [file, setFile] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setProgress(0);
  };

  const handleUpload = () => {
    if (!file) {
      setMessage("⚠️ Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setMessage("Uploading...");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        setMessage("✅ Upload complete!");
        setFile(null);
        onUploadComplete();
      } else {
        setMessage("❌ Upload failed!");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setMessage("❌ Upload error!");
    };

    xhr.send(formData);
  };

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {isUploading && (
        <>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="spinner"></div>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

// =====================
// File List - FIXED VERSION
// =====================
// =====================
// File List - UPDATED VERSION
// =====================
function FileList({ refreshTrigger }) {
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/files`);
      const data = await res.json();
      console.log("Files from server:", data); // Debug line
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDelete = async (file) => {
    const displayName = getDisplayName(file);
    if (!window.confirm(`Delete "${displayName}"?`)) return;
    
    try {
      await fetch(`${API_URL}/delete/${encodeURIComponent(file)}`, { 
        method: "DELETE" 
      });
      fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed");
    }
  };

  const handleDownload = (file) => {
    // Use encodeURIComponent to handle spaces in filenames
    const encodedFile = encodeURIComponent(file);
    const url = `${API_URL}/download/${encodedFile}`;
    console.log("Download URL:", url); // Debug line
    
    // Open in new tab - this should work now with the backend fix
    window.open(url, '_blank');
  };

  // Helper function to extract original filename
  const getDisplayName = (filename) => {
    return filename.split('-').slice(1).join('-');
  };

  // Remove duplicates just in case
  const uniqueFiles = [...new Set(files)];

 // TEMPORARY - For debugging only
return (
  <div className="file-list">
    <h3>📂 Uploaded Files</h3>
    {loading ? (
      <div className="spinner"></div>
    ) : uniqueFiles.length === 0 ? (
      <p className="empty-msg">No files uploaded yet.</p>
    ) : (
      <ul>
        {uniqueFiles.map((file, index) => (
          <li key={index}>
            <div>
              <strong>Display:</strong> {getDisplayName(file)}<br/>
              <strong>Stored:</strong> {file}
            </div>
            <div className="file-actions">
              <button onClick={() => handleDownload(file)}>⬇️</button>
              <button onClick={() => handleDelete(file)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);}
// =====================
// Root App
// =====================
function App() {
  const [refresh, setRefresh] = React.useState(false);
  const [storageUsed, setStorageUsed] = React.useState(0);

  const refreshFiles = () => setRefresh((r) => !r);

  React.useEffect(() => {
    fetch(`${API_URL}/files`)
      .then((res) => res.json())
      .then((files) => {
        const totalSize = files.length * 1.5; // estimate 1.5 MB/file
        setStorageUsed(Math.min(totalSize, 100));
      });
  }, [refresh]);

  return (
    <div>
      <h1>☁️ Cloud Storage Lite</h1>
      <p style={{ textAlign: "center" }}>
        Storage used: {storageUsed.toFixed(1)} MB / 100 MB
      </p>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${(storageUsed / 100) * 100}%` }}
        ></div>
      </div>
      <FileUploader onUploadComplete={refreshFiles} />
      <FileList refreshTrigger={refresh} />
    </div>
  );
}

// =====================
// Render
// =====================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
