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
    // Added dark:bg-slate-950 for the main background
    <div className="min-h-screen bg-teal-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 transition-colors duration-300 relative">
      
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold transition group"
      >
        <FiArrowLeft className="text-xl transform group-hover:-translate-x-1 transition" />
        Back to Home
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mt-8 sm:mt-0">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-3xl text-teal-600 dark:text-teal-400 mb-6">
          <span className="text-4xl">⚕️</span> MedIQ
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isLogin ? 'Sign in to your account' : 'Create your health profile'}
        </h2>
      </div>

      <div className={`mt-8 sm:mx-auto sm:w-full transition-all duration-300 ${isLogin ? 'sm:max-w-md' : 'sm:max-w-2xl'}`}>
        {/* Added dark:bg-slate-900 and dark:border-slate-800 for the card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-teal-100 dark:border-slate-800 transition-colors duration-300">
          
          {isLogin ? <Login /> : <Signup />}

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? "New to MedIQ? " : "Already have an account? "}
            <button 
              onClick={toggleMode}
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline transition"
            >
              {isLogin ? 'Register now' : 'Log in here'}
            </button>
          </p>
          
        </div>
      </div>
    </div>
  );
}