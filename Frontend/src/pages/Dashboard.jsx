import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiSun, FiMoon, FiActivity, FiFolder, FiSettings } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme state with the current HTML class when dashboard loads
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    // Redirect back to the home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* --- DASHBOARD NAVBAR --- */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-2 font-bold text-2xl text-teal-600 dark:text-teal-400">
            <span className="text-3xl">⚕️</span> MedIQ
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-6">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                <FiUser />
              </div>
              Demo User
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold transition bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
            >
              <FiLogOut /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Here is a quick overview of your health workspace.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Symptom Check */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transform group-hover:scale-110 transition-transform">
              <FiActivity className="text-8xl" />
            </div>
            <div className="w-12 h-12 bg-teal-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 border border-teal-100 dark:border-slate-700 relative z-10">
              <FiActivity className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">AI Symptom Check</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 relative z-10">Start a new AI consultation to check your current symptoms and get instant advice.</p>
            <button 
              onClick={() => navigate('/symptom-check')}
              className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-sm relative z-10"
            >
              Start Chat
            </button>
          </div>

          {/* Card 2: Health Records */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transform group-hover:scale-110 transition-transform">
              <FiFolder className="text-8xl" />
            </div>
            <div className="w-12 h-12 bg-teal-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 border border-teal-100 dark:border-slate-700 relative z-10">
              <FiFolder className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Health Records</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 relative z-10">View your saved medical history, past AI insights, and upload new lab results.</p>
            <button 
              onClick={() => navigate('/records')}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm relative z-10"
            >
              Open Vault
            </button>
          </div>

          {/* Card 3: Profile Settings (Placeholder) */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transform group-hover:scale-110 transition-transform">
              <FiSettings className="text-8xl" />
            </div>
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-6 border border-slate-100 dark:border-slate-700 relative z-10">
              <FiSettings className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Account Settings</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 relative z-10">Update your personal information, change your password, and manage preferences.</p>
            <button 
              onClick={() => alert('Settings page coming soon!')}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm relative z-10"
            >
              Manage Profile
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}