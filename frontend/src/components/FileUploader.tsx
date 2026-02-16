import { useState } from 'react';
import { api } from '../api';

interface FileUploaderProps {
  onUploadComplete: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
        // Reset input? Difficult without ref.
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        onUploadComplete();
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
    <div className="bg-white p-5 rounded-xl text-center shadow-lg transition-transform hover:shadow-xl w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Files</h2>
      
      <div className="flex flex-col items-center gap-4">
        <input 
          id="file-input"
          type="file" 
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
        />
        
        <button 
          onClick={handleUpload}
          className="bg-[#007bff] text-white py-3 px-6 rounded-xl font-semibold transition-all hover:bg-[#0056b3] hover:scale-105 active:scale-95 disabled:opacity-50"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#00c6ff] to-[#007bff] h-4 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {message && <p className="mt-4 text-[#007bff] font-medium">{message}</p>}
    </div>
  );
}
