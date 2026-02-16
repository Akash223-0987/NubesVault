import { useEffect, useState } from 'react';
import { api } from '../api';

const API_URL = "http://localhost:5000";

interface FileListProps {
  refreshTrigger: boolean;
}

export default function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    const iframe = document.getElementById('preview-iframe');
    if (!document.fullscreenElement) {
        if (iframe?.requestFullscreen) {
            iframe.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  useEffect(() => {
      const handleFullScreenChange = () => {
          setIsFullScreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () => {
          document.removeEventListener('fullscreenchange', handleFullScreenChange);
      };
  }, []);

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

  const handlePreview = async (file: string) => {
    const encodedFile = encodeURIComponent(file);
    const url = `${API_URL}/view/${encodedFile}`;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to load preview");
      
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      setPreviewFile(objectUrl);
      setIsFullScreen(false); // Reset to normal view on new preview
    } catch (err) {
      console.error(err);
      alert("Cannot preview this file type");
    }
  };

  const closePreview = () => {
    if (previewFile) {
      window.URL.revokeObjectURL(previewFile);
      setPreviewFile(null);
    }
  };

  const getDisplayName = (filename: string) => filename.split("-").slice(1).join("-");

  const isPreviewable = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'webm', 'mp3'].includes(ext || '');
  };

  const renderPreviewContent = () => {
    if (!previewFile) return null;
    return (
       <iframe src={previewFile} className="w-full h-full border-0 rounded-lg bg-white" title="Preview" />
    );
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="w-full relative">
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in" onClick={closePreview}>
          {/* Controls - Floating above everything */}
          <div className="fixed top-6 right-6 z-[200] flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={toggleFullScreen}
              className="bg-gray-900/80 hover:bg-indigo-600 text-white p-3 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all hover:scale-105 flex items-center justify-center group"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'} text-lg group-hover:rotate-180 transition-transform duration-300`}></i>
            </button>
            <button 
              onClick={closePreview}
              className="bg-gray-900/80 hover:bg-red-500 text-white p-3 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all hover:scale-105 flex items-center justify-center group"
              title="Close"
            >
              <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform duration-300"></i>
            </button>
          </div>

          <div 
            className="bg-gray-900 rounded-2xl flex flex-col relative shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 w-full max-w-6xl h-[85vh] z-[150]"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Content Area */}
              <div className="flex-1 w-full h-full relative bg-gray-950">
                 {/* Spinner */}
                 <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="spinner !border-gray-800 !border-t-indigo-500"></div>
                 </div>
                 {/* iFrame */}
                 <iframe 
                    id="preview-iframe"
                    src={previewFile} 
                    className="absolute inset-0 w-full h-full border-0 z-10 bg-white" 
                    title="Preview" 
                    allowFullScreen
                 />
              </div>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-folder-open text-gray-400 text-2xl"></i>
          </div>
          <p className="text-gray-500 font-medium">No files uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload a file to get started</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {[...new Set(files)].map((file, idx) => (
            <li 
              key={idx} 
              className="group flex justify-between items-center bg-white hover:bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                  {isPreviewable(file) ? <i className="fas fa-image text-lg"></i> : <i className="fas fa-file-alt text-lg"></i>}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-800 truncate block group-hover:text-indigo-600 transition-colors">
                    {getDisplayName(file)}
                  </span>
                  <span className="text-xs text-gray-500 truncate font-mono bg-gray-100/50 px-1.5 py-0.5 rounded w-fit">
                    {file.substring(0, 8)}...
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                {isPreviewable(file) && (
                  <button 
                    onClick={() => handlePreview(file)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Preview"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                )}
                <button 
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Download"
                >
                  <i className="fas fa-download"></i>
                </button>
                <button 
                  onClick={() => handleDelete(file)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
