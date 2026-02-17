import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_URL } from '../api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password Strength Logic
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return score;
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    

    try {
      const res = await api.post('/auth/signup', { name, email, password });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        navigate('/dashboard');
      } else {
        setError(data.msg || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network or server error');
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Premium Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative flex-col justify-center items-center overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gray-900"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse-glow"></div>
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px] animate-float"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[100px] animate-float-delayed"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-lg px-8 flex flex-col items-center">
          
          {/* Logo & Branding */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Cloud Storage
            </h1>
          </div>

          {/* Product Mockup (CSS-based) */}
          <div className="w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ease-out">
            <div className="flex gap-4 h-64">
              {/* Fake Sidebar */}
              <div className="w-16 flex flex-col gap-4 items-center pt-2 border-r border-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-indigo-400 rounded-sm"></div>
                </div>
                <div className="w-8 h-8 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-sm"></div>
                </div>
                <div className="w-8 h-8 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-500 rounded-full"></div>
                </div>
                <div className="mt-auto mb-2 w-8 h-1 bg-gray-700 rounded-full"></div>
              </div>

              {/* Fake Main Area */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Fake Header */}
                <div className="flex justify-between items-center">
                  <div className="w-32 h-4 bg-gray-700/50 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
                    <div className="w-8 h-8 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>

                {/* Fake File Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-700/30 p-3 rounded-lg flex flex-col gap-2 hover:bg-gray-700/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg ${i % 2 === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'} flex items-center justify-center`}>
                        <div className="w-4 h-4 rounded-sm bg-current opacity-50"></div>
                      </div>
                      <div className="w-16 h-2 bg-gray-600/50 rounded-full"></div>
                      <div className="w-8 h-1.5 bg-gray-700/50 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mockup Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none rounded-2xl"></div>
          </div>

          <p className="mt-8 text-lg text-gray-400 text-center max-w-sm">
            Experience the future of file management. Secure, fast, and beautifully designed.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Join thousands of users managing their files securely.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-3">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Sign up with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm ${
                      password 
                        ? (getStrength(password) === 3 ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500') 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    {/* Success Tick */}
                    {getStrength(password) === 3 && (
                      <i className="fas fa-check-circle text-green-500 animate-fade-in"></i>
                    )}
                    
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map((level) => (
                        <div 
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            getStrength(password) >= level 
                              ? (getStrength(password) === 1 ? 'bg-red-500' : getStrength(password) === 2 ? 'bg-yellow-500' : 'bg-green-500') 
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Real-time Validation Rules */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <div className={`flex items-center gap-1.5 transition-colors duration-300 ${password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors duration-300 ${/\d/.test(password) ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        <i className={`fas ${/\d/.test(password) ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                        Contains a number
                      </div>
                      <div className={`flex items-center gap-1.5 transition-colors duration-300 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        <i className={`fas ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Create account
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
