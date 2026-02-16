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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <div className="spinner w-12 h-12"></div>
        <h2 className="text-xl font-semibold text-gray-800">Finalizing Sign In</h2>
        <p className="text-gray-500">Redirecting you to your dashboard...</p>
      </div>
    </div>
  );
}
