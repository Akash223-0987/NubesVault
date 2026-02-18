import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-gray-900 bg-transparent pb-10">
      {/* Background Elements are handled by global css on body, but we can add specific ones here if needed */}
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 group-hover:scale-110 transition-transform">
              <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              NubesVault
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            {localStorage.getItem('token') ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Go to Dashboard <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-indigo-600 hover:bg-white/50 transition-all"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button - simplified for now, typically would toggle a modal */}
          <div className="sm:hidden">
             <button onClick={() => navigate('/login')} className="p-2 text-indigo-600 font-semibold">Log In</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center relative z-10">
        
        {/* Floating badge */}


        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl animate-fade-in">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">workspace</span> for your creative journey.
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Securely store, organize, and share your files with a beautiful, modern interface designed for focus.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg bg-gray-900 hover:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            Get Started Free <i className="fas fa-arrow-right"></i>
          </button>
          <button 
            onClick={() => navigate('/login')} // Demo/Login
            className="px-8 py-4 rounded-2xl font-bold text-gray-700 text-lg bg-white/50 hover:bg-white border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all backdrop-blur-md"
          >
            View Demo
          </button>
        </div>

        {/* Hero Visual / Mockup */}
        <div className="mt-20 w-full relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
           {/* Abstract Decoration */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full"></div>

           <div className="glass-card p-4 rounded-3xl border border-white/60 shadow-2xl relative transform hover:scale-[1.01] transition-transform duration-700">
             {/* Fake UI Header */}
             <div className="flex items-center gap-2 mb-4 px-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="flex-1 bg-gray-100/50 h-8 rounded-lg mx-4"></div>
             </div>
             
             {/* Fake Content Grid */}
             <div className="grid grid-cols-3 gap-4 h-64 md:h-96 w-full bg-white/50 rounded-xl overflow-hidden p-6 relative">
                {/* Floating Elements mimicking the dashboard */}
                <div className="col-span-2 row-span-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-pulse-glow"></div>
                <div className="col-span-1 row-span-2 bg-purple-50/50 rounded-2xl border border-purple-100/50"></div>
                <div className="col-span-1 bg-emerald-50/50 rounded-2xl border border-emerald-100/50"></div>
                <div className="col-span-1 bg-blue-50/50 rounded-2xl border border-blue-100/50"></div>
                <div className="col-span-1 bg-orange-50/50 rounded-2xl border border-orange-100/50"></div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                   <p className="text-gray-400 font-medium">Interactive Preview</p>
                </div>
             </div>
           </div>

           {/* Floating Cards Decorations */}
           <div className="absolute -left-12 top-1/3 glass-card p-4 rounded-2xl animate-float-delayed hidden md:block border-l-4 border-l-blue-400">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                   <i className="fas fa-file-alt"></i>
                 </div>
                 <div>
                   <p className="font-bold text-gray-800 text-sm">Project.pdf</p>
                   <p className="text-xs text-gray-500">Just uploaded</p>
                 </div>
              </div>
           </div>

           <div className="absolute -right-12 bottom-1/4 glass-card p-4 rounded-2xl animate-float hidden md:block border-l-4 border-l-emerald-400">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                   <i className="fas fa-check"></i>
                 </div>
                 <div>
                   <p className="font-bold text-gray-800 text-sm">Sync Complete</p>
                   <p className="text-xs text-gray-500">All files up to date</p>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 w-full text-left">
           <div className="p-6 rounded-3xl bg-white/30 border border-white/50 backdrop-blur-sm hover:bg-white/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mb-4">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-500">Upload and access your files instantly from anywhere in the world.</p>
           </div>
           <div className="p-6 rounded-3xl bg-white/30 border border-white/50 backdrop-blur-sm hover:bg-white/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure by Default</h3>
              <p className="text-gray-500">Enterprise-grade encryption keeps your data safe and private.</p>
           </div>
           <div className="p-6 rounded-3xl bg-white/30 border border-white/50 backdrop-blur-sm hover:bg-white/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mb-4">
                <i className="fas fa-magic"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Organization</h3>
              <p className="text-gray-500">AI-powered tools to help you keep your workspace clutter-free.</p>
           </div>
        </div>
      </main>

    </div>
  );
}

