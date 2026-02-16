import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import { api } from '../api';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 1024 * 1024 * 1024 });

  const refreshFiles = () => setRefresh((r) => !r);

  useEffect(() => {
    // Fetch real storage usage
    api.get('/usage')
      .then(res => res.json())
      .then(data => {
        if (data.used !== undefined) {
          setStorageStats({ used: data.used, limit: data.limit });
        }
      })
      .catch(err => console.error("Failed to fetch storage stats", err));
  }, [refresh]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = Math.min((storageStats.used / storageStats.limit) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10 max-w-7xl animate-fade-in">
        {/* Minimalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Drive</h1>
            <p className="text-gray-500 mt-1">Manage all your files in one secure place.</p>
          </div>
          
          <div className="bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm md:w-80">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Storage</span>
              <span className="text-sm text-indigo-600 font-bold">{formatSize(storageStats.used)} <span className="text-gray-400 font-normal">/ {formatSize(storageStats.limit)}</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar: Upload */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
               <FileUploader onUploadComplete={refreshFiles} />
            </div>
          </div>
          
          {/* Main Content: File List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] flex flex-col transition-colors duration-300">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">Recent Files</h2>
                <div className="flex gap-2">
                    {/* Placeholder for future sort/filter controls if needed */}
                </div>
              </div>
              <div className="p-6 flex-1">
                <FileList refreshTrigger={refresh} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
