import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import { api } from '../api';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);

  const refreshFiles = () => setRefresh((r) => !r);

  useEffect(() => {
    // Also fetch files to calculate storage
    api.get('/files')
      .then(res => res.json())
      .then(files => {
        // Placeholder calculation logic from script.js
        const totalSize = files.length * 1.5; // MB
        setStorageUsed(Math.min(totalSize, 500));
      });
  }, [refresh]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-8 max-w-5xl">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center text-sm text-gray-500 font-medium mb-2">
              <span>Cloud Usage</span>
              <span>{storageUsed.toFixed(1)} MB / 500 MB</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(storageUsed / 500) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <FileUploader onUploadComplete={refreshFiles} />
        
        <FileList refreshTrigger={refresh} />
      </main>
    </div>
  );
}
