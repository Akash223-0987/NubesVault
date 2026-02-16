import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
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
  };

  return (
    <header className="sticky top-0 z-50 px-0 sm:px-6 py-4 transition-colors duration-300">
      <nav className="glass bg-white/80 backdrop-blur-md rounded-none sm:rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg mx-auto max-w-7xl border-b sm:border border-gray-100">
        <h1 className="text-xl text-gray-800 font-bold m-0 flex items-center gap-2 tracking-tight">
          <div className="bg-indigo-500 p-1.5 rounded-lg w-8 h-8 flex items-center justify-center shadow-md shadow-indigo-500/30">
            <img src="/logo.svg" alt="Cloud Storage" className="w-full h-full brightness-0 invert" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Cloud Storage</span>
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout} 
            className="bg-white/50 hover:bg-red-50 text-red-500 border border-red-100 py-2 px-4 rounded-xl cursor-pointer font-semibold transition-all hover:shadow-md text-sm active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
