import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    console.log("OAuthCallback: Processing login...");
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log("OAuthCallback: Success, logging in user:", user.email);
        login(token, user);
      } catch (err) {
        console.error("OAuthCallback: Failed to parse user data", err);
        navigate('/login', { replace: true });
      }
    } else {
      console.warn("OAuthCallback: Missing token or user data");
      navigate('/login', { replace: true });
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 font-sans">
      <div className="glass-card p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <img src="/logo.svg" alt="Cloud Storage" className="w-20 h-20 drop-shadow-lg relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there...</h2>
          <p className="text-gray-600 font-medium">Finalizing your secure sign in</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
