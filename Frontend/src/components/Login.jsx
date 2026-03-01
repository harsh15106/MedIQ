import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient'; //
import toast from 'react-hot-toast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Real Supabase Login Logic
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    }); //

    if (error) {
      toast.error(error.message); // Displays real errors (e.g., "Invalid login credentials")
      setLoading(false);
    } else {
      toast.success('Successfully logged in!');
      // After login, check if the user has a completed profile
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700 ">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none text-sm transition-colors bg-white/50 backdrop-blur-sm"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700 ">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none text-sm pr-10 transition-colors bg-white/50 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-theme-accent transition-colors"
            >
              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white font-semibold rounded-full hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-ai-glow hover:shadow-ai-glow-hover flex justify-center items-center mt-6 cursor-pointer"
        >
          {loading ? 'Verifying Neural Match...' : 'Access AI Dashboard'}
        </button>
      </form>
    </div>
  );
}