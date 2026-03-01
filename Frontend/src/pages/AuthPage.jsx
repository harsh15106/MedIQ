import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Login from '../components/Login';
import Signup from '../components/Signup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location]);

  const toggleMode = () => {
    if (isLogin) {
      navigate('/auth?mode=signup');
    } else {
      navigate('/auth?mode=login');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col lg:flex-row font-sans text-theme-text transition-colors duration-300 relative overflow-hidden">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-theme-surface-alt hover:text-white font-medium transition-colors group px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
      >
        <FiArrowLeft className="text-xl transform group-hover:-translate-x-1 transition" />
        Back
      </button>

      {/* Left Side: Brand & Messaging (Dark AI Theme) */}
      <div className="w-full lg:w-5/12 bg-gradient-to-br from-theme-accent-dark to-theme-accent-deep border-r border-white/10 flex flex-col justify-center p-12 lg:p-20 relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        {/* Subtle abstract background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-theme-accent opacity-20 blur-[100px] rounded-full mix-blend-screen"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 font-semibold text-3xl text-white tracking-tight">
              <img src="/LOGO.png" alt="MedIQ Logo" className="w-10 h-10 object-contain" /> MedIQ
            </Link>
          </div>

          <div className="mt-16 lg:mt-0">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 text-theme-surface-alt px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-widest uppercase">
              Secure Access
            </div>
            <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
              Your Health <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-theme-accent-light">
                Intelligence
              </span> <br /> Starts Here.
            </h1>
            <p className="text-theme-surface-alt opacity-90 text-lg font-normal max-w-sm">
              Log in or create an account to access real-time symptom analysis and predictive risk modeling.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Glassmorphism Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative bg-theme-bg">

        <div className={`w-full transition-all duration-500 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>

          <div className="text-center mb-8 lg:hidden">
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              {isLogin ? 'Sign In to MedIQ' : 'Create Free Account'}
            </h2>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl p-8 sm:p-10 shadow-sm border border-white/50 rounded-3xl relative group hover:shadow-ai-glow transition-all duration-500">

            {/* Soft teal border glow effect via pseudo-element illusion */}
            <div className="absolute inset-0 rounded-3xl border border-theme-accent/0 pointer-events-none group-hover:border-theme-accent/30 transition-colors duration-500"></div>

            <div className="relative z-10">
              {isLogin ? <Login /> : <Signup />}

              <p className="mt-8 text-center text-sm text-theme-text-muted">
                {isLogin ? "New to MedIQ? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="font-semibold text-theme-accent hover:text-theme-accent-light transition-colors ml-1"
                >
                  {isLogin ? 'Create free account' : 'Sign in here'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}