import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 flex justify-between items-center px-8 py-4 bg-white shadow-md z-50 rounded-b-[10px]">
      <h1 className="text-2xl text-[#007bff] font-bold m-0 flex items-center gap-2">
        <i className="fas fa-cloud"></i> Cloud Storage
      </h1>
      <nav className="flex items-center gap-4">
        {/* <a href="#" className="text-gray-800 font-medium hover:text-[#007bff] transition-colors">Home</a> */}
        <button 
          onClick={handleLogout} 
          className="bg-[#ff4d4d] text-white border-none py-1.5 px-3 rounded-lg cursor-pointer font-semibold transition-colors hover:bg-[#cc0000]"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
