import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import StorageWidget from '../components/StorageWidget';
import { api } from '../api';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 20 * 1024 * 1024 * 1024 });
  const [showUploader, setShowUploader] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const refreshFiles = useCallback(() => setRefresh((r) => !r), []);

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

    // Fetch file count
    api.get('/files')
      .then(res => res.json())
      .then(data => setFileCount(data.length))
      .catch(err => console.error("Failed to fetch file count", err));
  }, [refresh]);

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const usagePercent = useMemo(() => 
    Math.min((storageStats.used / storageStats.limit) * 100, 100),
    [storageStats.used, storageStats.limit]
  );
  
  const userName = "Akash"; // Keeping this hardcoded as per request "Good evening, Akash"

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300 pb-10">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10 max-w-7xl animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            You have <span className="font-semibold text-gray-900">{fileCount} files</span> and <span className="font-semibold text-gray-900">3 folders</span>.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Upload Section (Large - 2x2) */}
          <div className="col-span-1 sm:col-span-2 row-span-2 glass-card rounded-3xl p-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="p-6 pb-2">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-indigo-100/50 p-2 rounded-lg text-indigo-600">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </span>
                  Quick Upload
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-11">Drag & drop files here to upload instantly</p>
              </div>
              <div className="flex-1 p-4">
                 <FileUploader onUploadComplete={refreshFiles} />
              </div>
            </div>
          </div>

          {/* 2. Quick Actions (Standard - 1x2 to fill vertical space) */}
          <div className="col-span-1 sm:col-span-1 row-span-2 glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             
             <div>
               <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <span className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                    <i className="fas fa-bolt"></i>
                  </span>
                  Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <button className="w-full p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 flex items-center gap-3 transition-all hover:shadow-sm group/btn text-left">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/btn:scale-110 transition-transform">
                      <i className="fas fa-folder-plus"></i>
                    </div>
                    <span className="font-medium text-gray-700">New Folder</span>
                  </button>
                  
                  <button className="w-full p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 flex items-center gap-3 transition-all hover:shadow-sm group/btn text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover/btn:scale-110 transition-transform">
                      <i className="fas fa-file-contract"></i>
                    </div>
                    <span className="font-medium text-gray-700">New Doc</span>
                  </button>
                  
                  <button className="w-full p-3 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 flex items-center gap-3 transition-all hover:shadow-sm group/btn text-left">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover/btn:scale-110 transition-transform">
                      <i className="fas fa-share-alt"></i>
                    </div>
                    <span className="font-medium text-gray-700">Share Files</span>
                  </button>
                </div>
             </div>
          </div>
          
           {/* 5. Main File List (Full Width) */}
           <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 glass-card rounded-3xl overflow-hidden min-h-[400px]">
              <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/30 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-layer-group text-indigo-500"></i> Your Files
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:bg-white/50 rounded-lg transition-colors"><i className="fas fa-search"></i></button>
                  <button className="p-2 text-gray-500 hover:bg-white/50 rounded-lg transition-colors"><i className="fas fa-filter"></i></button>
                </div>
              </div>
              <div className="p-6">
                <FileList refreshTrigger={refresh} />
              </div>
           </div>
        </div>


      </main>



      {/* Floating Storage Widget */}
      <StorageWidget />
    </div>
  );
}
