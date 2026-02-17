import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import { api } from '../api';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 1024 * 1024 * 1024 });
  const [showUploader, setShowUploader] = useState(false);
  const [fileCount, setFileCount] = useState(0);

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

    // Fetch file count
    api.get('/files')
      .then(res => res.json())
      .then(data => setFileCount(data.length))
      .catch(err => console.error("Failed to fetch file count", err));
  }, [refresh]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = Math.min((storageStats.used / storageStats.limit) * 100, 100);
  const userName = "Akash"; // Keeping this hardcoded as per request "Good evening, Akash"

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-6 py-10 max-w-7xl animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {getTimeGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            You have <span className="font-semibold text-gray-900">{fileCount} files</span> and <span className="font-semibold text-gray-900">3 folders</span>.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Upload Section (Large - 2x2) */}
          <div className="md:col-span-2 md:row-span-2 glass-card rounded-3xl p-1 relative overflow-hidden group">
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

          {/* 2. Storage Usage (Tall - 1x2) */}
          <div className="md:col-span-1 md:row-span-2 glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
             
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-hdd text-emerald-500"></i> Storage
                </h2>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                  {Math.round(usagePercent)}%
                </span>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Circular Progress */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * usagePercent) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-gray-900">{formatSize(storageStats.used)}</span>
                   <span className="text-xs text-gray-500">Used</span>
                </div>
             </div>

             <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Documents</span>
                   <span className="font-medium text-gray-700">65%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                   <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Images</span>
                   <span className="font-medium text-gray-700">25%</span>
                </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5">
                   <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
             </div>
             
             <div className="mt-auto pt-6 text-center">
                <p className="text-xs text-gray-400">Total Limit: {formatSize(storageStats.limit)}</p>
             </div>
          </div>

          {/* 3. Quick Actions (Standard - 1x2 to fill vertical space) */}
          <div className="md:col-span-1 md:row-span-2 glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
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
             
             <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">PRO TIP</p>
                <p className="text-xs text-blue-600/80">Drag and drop files anywhere to upload instantly.</p>
             </div>
          </div>
          
           {/* 5. Main File List (Full Width) */}
           <div className="md:col-span-3 lg:col-span-4 glass-card rounded-3xl overflow-hidden min-h-[400px]">
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
    </div>
  );
}
