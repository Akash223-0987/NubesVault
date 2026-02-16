import { useState } from 'react';

interface FileUploaderProps {
  onUploadComplete: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage('');
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ Please select a file!');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    
    // Using XMLHttpRequest for progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        setMessage('✅ Upload complete!');
        setFile(null);
        onUploadComplete();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Upload failed!');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setMessage('❌ Upload error!');
    };

    xhr.send(formData);
  };

  return (
    <div className="glass-card bg-white p-6 rounded-2xl w-full text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center justify-center gap-2">
        <i className="fas fa-cloud-upload-alt text-indigo-500"></i> Upload File
      </h2>
      
      <div 
        className={`
          border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer relative bg-white/40
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          id="file-input"
          type="file" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2 pointer-events-none">
          {file ? <i className="fas fa-file-alt text-2xl"></i> : <i className="fas fa-cloud-upload-alt text-2xl"></i>}
        </div>
        
        <div className="pointer-events-none">
          {file ? (
            <p className="font-medium text-indigo-900 truncate max-w-[200px]">{file.name}</p>
          ) : (
            <>
              <p className="font-medium text-gray-700">Drag & Drop or Click</p>
              <p className="text-xs text-gray-400 mt-1">Supports all file types</p>
            </>
          )}
        </div>
      </div>

      <button 
        onClick={handleUpload}
        className={`
          w-full mt-6 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98]
          ${!file || isUploading 
            ? 'bg-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/30'}
        `}
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <i className="fas fa-spinner fa-spin"></i> Uploading...
          </span>
        ) : 'Upload File'}
      </button>

      {isUploading && (
        <div className="w-full bg-gray-100/50 rounded-full h-2 mt-4 overflow-hidden border border-gray-100">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {message && (
        <div className={`mt-4 text-sm font-medium p-2 rounded-lg animate-fade-in ${message.includes('complete') ? 'text-green-600 bg-green-50' : message.includes('failed') || message.includes('error') ? 'text-red-600 bg-red-50' : 'text-indigo-600 bg-indigo-50'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
