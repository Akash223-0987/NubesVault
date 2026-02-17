import { useEffect, useState, useMemo, useCallback } from 'react';
import { api, API_URL } from '../api';

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

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
    if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html'].includes(ext || '')) return 'text';
    return 'other';
  };

  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(100);

  const handlePreviewWithName = (file: string) => {
    setCurrentFileName(file);
    handlePreview(file);
    setZoomLevel(100);
  };

  const renderPreviewContent = () => {
    if (!previewFile) return null;
    
    const fileType = getFileType(currentFileName);
    
    switch (fileType) {
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center p-8 overflow-auto bg-gray-950">
            <img 
              src={previewFile} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe 
            id="preview-iframe"
            src={previewFile} 
            className="w-full h-full border-0 bg-white" 
            title="PDF Preview"
            allowFullScreen
          />
        );
      
      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center p-8 bg-gray-950">
            <video 
              src={previewFile} 
              controls 
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              style={{ maxHeight: '80vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-950">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <i className="fas fa-music text-white text-5xl"></i>
            </div>
            <h3 className="text-white text-xl font-semibold mb-6">{getDisplayName(currentFileName)}</h3>
            <audio 
              src={previewFile} 
              controls 
              className="w-full max-w-md shadow-lg"
              autoPlay
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      default:
        return (
          <iframe 
            id="preview-iframe"
            src={previewFile} 
            className="w-full h-full border-0 bg-white" 
            title="Preview"
            allowFullScreen
          />
        );
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="w-full relative">
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in" onClick={closePreview}>
          {/* Top Bar with File Name */}
          <div className="fixed top-0 left-0 right-0 z-[200] bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <i className={`fas ${getFileType(currentFileName) === 'image' ? 'fa-image' : getFileType(currentFileName) === 'pdf' ? 'fa-file-pdf' : getFileType(currentFileName) === 'video' ? 'fa-video' : getFileType(currentFileName) === 'audio' ? 'fa-music' : 'fa-file'} text-white`}></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{getDisplayName(currentFileName)}</h3>
                  <p className="text-gray-400 text-sm">{getFileType(currentFileName).toUpperCase()} File</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Zoom Controls for Images */}
                {getFileType(currentFileName) === 'image' && (
                  <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                    <button
                      onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                      className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
                      title="Zoom Out"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="text-white text-sm font-medium min-w-[60px] text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
                      title="Zoom In"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="ml-2 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium transition-colors"
                      title="Reset Zoom"
                    >
                      Reset
                    </button>
                  </div>
                )}
                
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(currentFileName)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-colors shadow-lg"
                  title="Download"
                >
                  <i className="fas fa-download"></i>
                  <span className="hidden sm:inline">Download</span>
                </button>
                
                {/* Fullscreen Toggle */}
                <button 
                  onClick={toggleFullScreen}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-colors border border-gray-700"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                </button>
                
                {/* Close Button */}
                <button 
                  onClick={closePreview}
                  className="w-10 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg"
                  title="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div 
            className="w-full h-full pt-20 pb-4 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full max-w-7xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-indigo-200/50 rounded-xl bg-white/20 backdrop-blur-sm">
          <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <i className="fas fa-folder-open text-indigo-400 text-2xl"></i>
          </div>
          <p className="text-gray-600 font-medium">No files uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload a file to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...new Set(files)].map((file, idx) => (
            <div 
              key={idx} 
              className="group relative glass-card p-4 rounded-2xl border border-white/40 hover:border-indigo-300/50 bg-white/40 hover:bg-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between overflow-hidden"
            >
              {/* Top Section: Icon & Actions */}
              <div className="flex justify-between items-start mb-3">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-inner flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300 border border-white/60">
                    {isPreviewable(file) ? <i className="fas fa-image text-xl"></i> : <i className="fas fa-file-alt text-xl"></i>}
                 </div>
                 
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    {isPreviewable(file) && (
                      <button 
                        onClick={() => handlePreviewWithName(file)}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm"
                        title="Preview"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownload(file)}
                      className="w-8 h-8 rounded-full bg-white/80 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 flex items-center justify-center transition-colors shadow-sm"
                      title="Download"
                    >
                      <i className="fas fa-download text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(file)}
                      className="w-8 h-8 rounded-full bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                 </div>
              </div>

              {/* Bottom Section: File Info */}
              <div>
                 <h3 className="font-semibold text-gray-800 truncate mb-1 group-hover:text-indigo-700 transition-colors" title={getDisplayName(file)}>
                    {getDisplayName(file)}
                 </h3>
                 <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-mono bg-indigo-50/50 px-1.5 py-0.5 rounded text-indigo-400">{file.substring(0, 8)}...</span>
                    <span>1.2 MB</span>
                 </div>
              </div>
              
              {/* Decorative Gradient Blob */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
