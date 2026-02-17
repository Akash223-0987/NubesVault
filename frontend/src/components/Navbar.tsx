import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const [showActivity, setShowActivity] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 20 * 1024 * 1024 * 1024 });
  const [userProfile, setUserProfile] = useState({ name: 'User', email: '', initial: 'U' });

  // Fetch user profile and storage stats
  useEffect(() => {
    // Fetch user profile
    api.get('/user/profile')
      .then(res => res.json())
      .then(data => {
        setUserProfile({
          name: data.name || 'User',
          email: data.email || localStorage.getItem('userEmail') || 'user@example.com',
          initial: (data.name || 'U').charAt(0).toUpperCase()
        });
      })
      .catch(err => {
        console.error("Failed to fetch user profile", err);
        // Fallback to localStorage
        const email = localStorage.getItem('userEmail') || 'user@example.com';
        setUserProfile({
          name: email.split('@')[0],
          email: email,
          initial: email.charAt(0).toUpperCase()
        });
      });

    // Fetch storage stats
    api.get('/usage')
      .then(res => res.json())
      .then(data => {
        if (data.used !== undefined) {
          setStorageStats({ used: data.used, limit: data.limit });
        }
      })
      .catch(err => console.error("Failed to fetch storage stats", err));
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Best effort logout
      await api.get('/auth/logout').catch(() => {}); 
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <header className="sticky top-0 z-50 px-0 sm:px-6 py-4 transition-colors duration-300">
        <nav className="glass bg-white/60 backdrop-blur-xl rounded-none sm:rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg shadow-indigo-500/5 mx-auto max-w-7xl border border-white/40">
          <h1 className="text-xl text-gray-800 font-bold m-0 flex items-center gap-2 tracking-tight">
            <img src="/logo.svg" alt="NubesVault" className="w-8 h-8" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">NubesVault</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowActivity(true)}
              className="w-10 h-10 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-all hover:shadow-md hover:scale-105 group relative"
              title="Activity Timeline"
            >
              <i className="fas fa-history text-lg group-hover:rotate-12 transition-transform"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 border-2 border-white"
              >
                <span className="text-sm">{userProfile.initial}</span>
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {userProfile.initial}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{userProfile.name}</h3>
                          <p className="text-sm text-gray-500">{userProfile.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Storage Info */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Storage Used</span>
                        <span className="text-sm font-bold text-indigo-600">
                          {Math.round((storageStats.used / storageStats.limit) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((storageStats.used / storageStats.limit) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(storageStats.used / (1024 * 1024 * 1024)).toFixed(2)} GB of {(storageStats.limit / (1024 * 1024 * 1024)).toFixed(0)} GB used
                      </p>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                          <i className="fas fa-user text-sm"></i>
                        </div>
                        <span className="font-medium text-gray-700">Account Settings</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                          <i className="fas fa-cog text-sm"></i>
                        </div>
                        <span className="font-medium text-gray-700">Preferences</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <i className="fas fa-hdd text-sm"></i>
                        </div>
                        <span className="font-medium text-gray-700">Manage Storage</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <i className="fas fa-question-circle text-sm"></i>
                        </div>
                        <span className="font-medium text-gray-700">Help & Support</span>
                      </button>
                    </div>
                    
                    {/* Logout */}
                    <div className="p-2 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                          <i className="fas fa-sign-out-alt text-sm"></i>
                        </div>
                        <span className="font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Activity Timeline Modal */}
      {showActivity && (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setShowActivity(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"></div>
          <div 
            className="relative z-10 w-full max-w-md h-full bg-white/80 backdrop-blur-2xl border-l border-white/40 shadow-2xl animate-slide-in-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/40">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <i className="fas fa-history"></i>
                  </span>
                  Activity Timeline
                </h2>
                <button 
                  onClick={() => setShowActivity(false)}
                  className="w-8 h-8 rounded-full bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6 relative overflow-hidden group shadow-sm border border-indigo-100">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <i className="fas fa-rocket text-4xl text-indigo-500 group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-12"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500 text-sm max-w-[260px] leading-relaxed">
                  We're building a powerful timeline to track every move in your workspace. Stay tuned for updates!
                </p>
                
                <div className="mt-8 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-150"></span>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
