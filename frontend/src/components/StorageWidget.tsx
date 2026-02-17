import { useState, useEffect } from 'react';
import { api } from '../api';

export default function StorageWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 20 * 1024 * 1024 * 1024 });

  useEffect(() => {
    // Fetch storage stats
    const fetchStorage = () => {
      api.get('/usage')
        .then(res => res.json())
        .then(data => {
          if (data.used !== undefined) {
            setStorageStats({ used: data.used, limit: data.limit });
          }
        })
        .catch(err => console.error("Failed to fetch storage stats", err));
    };

    fetchStorage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = Math.min((storageStats.used / storageStats.limit) * 100, 100);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all hover:scale-110 group"
        title="Storage Info"
      >
        <i className="fas fa-hdd text-xl group-hover:scale-110 transition-transform"></i>
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-emerald-600 shadow-md">
          {Math.round(usagePercent)}%
        </span>
      </button>

      {/* Storage Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}></div>
          <div className="fixed bottom-24 right-6 z-50 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                  <i className="fas fa-hdd"></i>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Storage</h2>
                  <p className="text-xs text-gray-500">Your cloud storage usage</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Storage Circle */}
            <div className="p-6 flex flex-col items-center">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="90"
                    cx="96"
                    cy="96"
                  />
                  <circle
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    strokeDasharray={565}
                    strokeDashoffset={565 - (565 * usagePercent) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="90"
                    cx="96"
                    cy="96"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{formatSize(storageStats.used)}</span>
                  <span className="text-sm text-gray-500">Used</span>
                </div>
              </div>

              <div className="w-full mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Storage</span>
                  <span className="font-bold text-gray-900">{formatSize(storageStats.limit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-bold text-emerald-600">{formatSize(storageStats.limit - storageStats.used)}</span>
                </div>
              </div>
            </div>

            {/* File Type Breakdown */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Storage Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Documents</span>
                    <span className="font-medium text-gray-700">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Images</span>
                    <span className="font-medium text-gray-700">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Others</span>
                    <span className="font-medium text-gray-700">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
