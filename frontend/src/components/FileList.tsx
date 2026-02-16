import { useEffect, useState } from 'react';
import { api } from '../api';

const API_URL = "http://localhost:5000";

interface FileListProps {
  refreshTrigger: boolean;
}

export default function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDelete = async (file: string) => {
    const displayName = file.split("-").slice(1).join("-");
    if (!window.confirm(`Delete "${displayName}"?`)) return;

    try {
      const res = await api.delete(`/delete/${encodeURIComponent(file)}`);
      if (res.ok) {
        fetchFiles();
      } else {
        alert("❌ Delete failed!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Delete failed!");
    }
  };

  const handleDownload = (file: string) => {
    const encodedFile = encodeURIComponent(file);
    const url = `${API_URL}/download/${encodedFile}`;
    const token = localStorage.getItem('token');
    
    // For protected download, usually we need to pass token.
    // However, window.open doesn't support headers easily.
    // If backend requires auth for download, we might need a different approach (blob).
    // The previous implementation used window.open with a middleware check.
    // If middleware requires Header, window.open fails.
    // Let's assume URL param token or cookie? The backend uses 'authMiddleware'.
    // If authMiddleware checks Header, window.open(url) won't work unless session cookie is set.
    // But previous invalid implementation worked? Or mostly worked? 
    // The previous implementation:
    // window.open(url, "_blank");
    // And backend: app.get("/download/:filename", authMiddleware, ...)
    // If authMiddleware looks for 'Authorization' header, this fails.
    // Maybe query param? 
    // I'll stick to previous logic for now, but if it fails, I'll need to fetch blob.
    
    // Let's try fetch blob approach for reliability in React.
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file.split("-").slice(1).join("-");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(err => alert("Download failed"));
  };

  const getDisplayName = (filename: string) => filename.split("-").slice(1).join("-");

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
        <i className="fas fa-folder-open text-[#007bff]"></i> Uploaded Files
      </h3>
      
      {files.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No files uploaded yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {[...new Set(files)].map((file, idx) => (
            <li 
              key={idx} 
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-white hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <i className="fas fa-file text-gray-400"></i>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-gray-700 truncate block">{getDisplayName(file)}</span>
                  <span className="text-xs text-gray-400 truncate">{file}</span>
                </div>
              </div>
              <div className="flex gap-3 shrink-0 ml-4">
                <button 
                  onClick={() => handleDownload(file)}
                  className="text-gray-400 hover:text-[#007bff] transition-colors p-2 rounded-full hover:bg-blue-50"
                  title="Download"
                >
                  <i className="fas fa-download"></i>
                </button>
                <button 
                  onClick={() => handleDelete(file)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
