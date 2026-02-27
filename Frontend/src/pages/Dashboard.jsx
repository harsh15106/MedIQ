import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient'; // Ensure this path is correct
import { FiUser, FiSun, FiMoon, FiActivity, FiFolder, FiSettings } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: ''
  });

  // Dynamic Data States
  const [stats, setStats] = useState({
    profileCompletion: 0,
    recentLogsCount: 0,
    activeRemindersCount: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Theme Logic
    if (localStorage.theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // 1. Fetch Profile for Name & Completion
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({ first_name: profileData.first_name, last_name: profileData.last_name });

          // Calculate Profile Completion
          const fieldsToCheck = ['first_name', 'last_name', 'phone', 'city', 'state', 'country', 'pincode', 'dob', 'blood_group'];
          const filledFields = fieldsToCheck.filter(field => profileData[field] && profileData[field] !== '').length;
          const completionPercentage = Math.round((filledFields / fieldsToCheck.length) * 100);

          setStats(prev => ({ ...prev, profileCompletion: completionPercentage }));
        }

        // 2. Fetch Health Records for Count & Activity Feed
        const { data: recordsData, error: recordsError } = await supabase
          .from('Health_Records')
          .select('id, created_at, filter:file_path, blood_group') // We select a few to determine the type of activity
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!recordsError && recordsData) {
          setStats(prev => ({ ...prev, recentLogsCount: recordsData.length }));

          // Format Activities
          const formattedActivities = recordsData.slice(0, 3).map(record => {
            const isFile = !!record.filter;
            return {
              id: record.id,
              title: isFile ? "Document Uploaded" : "Health Log Updated",
              time: new Date(record.created_at).toLocaleDateString() + ' ' + new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon: isFile ? <FiFolder /> : <FiActivity />,
              color: isFile ? "text-blue-500" : "text-teal-500",
              bgColor: isFile ? "bg-blue-50 dark:bg-blue-900/20" : "bg-teal-50 dark:bg-teal-900/20"
            };
          });
          setActivities(formattedActivities);
        }

        // 3. Fetch Active Reminders
        const { data: remindersData, error: remindersError } = await supabase
          .from('reminders')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!remindersError && remindersData) {
          setStats(prev => ({ ...prev, activeRemindersCount: remindersData.length }));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* WELCOME SECTION */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {profile.first_name || 'User'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Here's your health overview for today.</p>
        </header>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
          <StatWidget title="Active Reminders" value={stats.activeRemindersCount} subtitle="Scheduled tasks" icon={<FiActivity className="text-teal-600 dark:text-teal-400" />} bgClass="bg-teal-50 dark:bg-teal-900/20" />
          <StatWidget title="Total Logs" value={stats.recentLogsCount} subtitle="Saved to your vault" icon={<FiFolder className="text-blue-600 dark:text-blue-400" />} bgClass="bg-blue-50 dark:bg-blue-900/20" />
          <StatWidget title="Profile Completion" value={`${stats.profileCompletion}%`} subtitle={stats.profileCompletion === 100 ? "All set!" : "Almost there!"} icon={<FiUser className="text-purple-600 dark:text-purple-400" />} bgClass="bg-purple-50 dark:bg-purple-900/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT CONTENT AREA: RECENT ACTIVITY & CHART PLAChEHOLDER */}
          <div className="lg:col-span-2 space-y-8">

            {/* Health Tip Card */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 -translate-y-4 translate-x-4">
                <FiSun size={120} />
              </div>
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                  Daily Tip
                </div>
                <h2 className="text-2xl font-bold mb-2">Stay Hydrated!</h2>
                <p className="text-teal-50 max-w-md">Drinking enough water helps maintain your blood pressure and clears toxins. Aim for at least 8 glasses today.</p>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <button
                  onClick={() => navigate('/records')}
                  className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  View All
                </button>
              </div>
              <div className="space-y-6">
                {loading ? (
                  <div className="text-sm text-slate-500 animate-pulse">Loading activity...</div>
                ) : activities.length === 0 ? (
                  <div className="text-sm text-slate-500">No recent activity found. Start a symptom check or upload a log!</div>
                ) : (
                  activities.map((activity) => (
                    <ActivityItem key={activity.id} title={activity.title} time={activity.time} icon={activity.icon} color={activity.color} bgColor={activity.bgColor} />
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: QUICK ACTIONS */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white px-2">Quick Actions</h3>

            <QuickActionCard
              title="New Symptom Check"
              desc="Start an AI consultation instantly."
              icon={<FiActivity size={24} />}
              onClick={() => navigate('/symptom-check')}
              primary
            />

            <QuickActionCard
              title="Health Vault"
              desc="Access your medical records securely."
              icon={<FiFolder size={24} />}
              onClick={() => navigate('/records')}
            />

            <QuickActionCard
              title="Settings"
              desc="Manage your preferences."
              icon={<FiSettings size={24} />}
              onClick={() => navigate('/settings')}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatWidget({ title, value, subtitle, icon, bgClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${bgClass}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, icon, color, bgColor }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor} ${color} border border-slate-100 dark:border-slate-800`}>
        {icon}
      </div>
      <div className="flex-1 pb-4 border-b border-slate-50 dark:border-slate-800/50 group-last:border-0 group-last:pb-0">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md group flex items-start gap-4 cursor-pointer ${primary
        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-teal-300 dark:hover:border-teal-700'
        }`}
    >
      <div className={`p-3 rounded-xl shrink-0 ${primary
        ? 'bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900'
        : 'bg-slate-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30'
        }`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-base mb-1">{title}</h4>
        <p className={`text-xs ${primary ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}