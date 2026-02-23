import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  // State to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    // --- DUMMY LOGIN LOGIC ---
    if (email === 'user@mediq.com' && password === 'admin123') {
      // Success! Send them to the medical profile onboarding
      toast.success('Successfully logged in!');
      navigate('/onboarding');
    } else {
      // Fail! Show an error
      setError('Invalid credentials. Try: user@mediq.com / admin123');
    }
  };

  const handleGoogleLogin = () => {
    // Google login bypasses to onboarding for testing purposes
    navigate('/onboarding');
  };

  return (
    <div className="space-y-6">
      {/* Google Auth Button */}
      <button 
        onClick={handleGoogleLogin}
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm font-medium text-slate-700 dark:text-slate-300"
      >
        <FcGoogle className="text-2xl" />
        Sign in with Google (Demo)
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Or continue with email
          </span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* Error Message Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input 
            type="email" 
            required 
            placeholder="user@mediq.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm transition-colors" 
          />
        </div>
        
        {/* Password Field with Eye Icon */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="admin123" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm pr-10 transition-colors" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
            >
              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-md"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}