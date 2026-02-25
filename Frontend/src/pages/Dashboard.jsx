import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient'; // Ensure this path is correct
import { FiUser, FiSun, FiMoon, FiActivity, FiFolder, FiSettings } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // --- NEW STATE FOR PROFILE ---
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Theme Logic
    if (localStorage.theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // --- FETCH PROFILE DATA ---
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  // Helper to get initials
  const initials = `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || 'U'}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* --- DASHBOARD NAVBAR --- */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-2 font-bold text-2xl text-teal-600 dark:text-teal-400">
            <span className="text-3xl">⚕️</span> MedIQ
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {/* UPDATED: Dynamic User Info */}
            <button 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-4 sm:pl-6 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 font-bold text-xs">
                {initials}
              </div>
              <span className="hidden sm:inline">
                {loading ? 'Loading...' : `${profile.first_name || 'User'}`}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {profile.first_name || 'User'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Here is a quick overview of your health workspace.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Symptom Check */}
          <DashboardCard 
            title="AI Symptom Check" 
            desc="Start a new AI consultation to check your current symptoms."
            icon={<FiActivity />}
            btnText="Start Chat"
            onClick={() => navigate('/symptom-check')}
            primary
          />

          {/* Card 2: Health Records */}
          <DashboardCard 
            title="Health Records" 
            desc="View your saved medical history and past AI insights."
            icon={<FiFolder />}
            btnText="Open Vault"
            onClick={() => navigate('/records')}
          />

          {/* Card 3: Profile Settings */}
          <DashboardCard 
            title="Account Settings" 
            desc="Update your personal information and manage preferences."
            icon={<FiSettings />}
            btnText="Manage Profile"
            onClick={() => navigate('/settings')}
          />
        </div>
      </main>
    </div>
  );
}

// Sub-component for cleaner code
function DashboardCard({ title, desc, icon, btnText, onClick, primary = false }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transform group-hover:scale-110 transition-transform text-8xl">
        {icon}
      </div>
      <div className="w-12 h-12 bg-teal-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 border border-teal-100 dark:border-slate-700 relative z-10 text-xl">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">{title}</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 relative z-10">{desc}</p>
      <button 
        onClick={onClick}
        className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold transition shadow-sm relative z-10 cursor-pointer ${
          primary ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
        }`}
      >
        {btnText}
      </button>
    </div>
  );
}