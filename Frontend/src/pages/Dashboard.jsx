import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { FiUser, FiActivity, FiFolder, FiSettings, FiTrendingUp, FiCpu, FiShield } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const defaultSymptomData = [
  { subject: 'Fatigue', frequency: 0, fullMark: 100 },
  { subject: 'Headache', frequency: 0, fullMark: 100 },
  { subject: 'Nausea', frequency: 0, fullMark: 100 },
  { subject: 'Fever', frequency: 0, fullMark: 100 },
  { subject: 'Cough', frequency: 0, fullMark: 100 },
  { subject: 'Pain', frequency: 0, fullMark: 100 },
];

const dailyQuotes = [
  "Your recent hydration and activity levels indicate stable cardiovascular metrics.",
  "Consistent sleep patterns are strongly correlated with improved cognitive function today.",
  "Your resting heart rate trends suggest excellent recovery from recent activities.",
  "Slight elevations in stress metrics detected; consider a brief mindfulness exercise.",
  "Optimal vitamin D synthesis timezone approaching based on your location.",
  "Your physical activity baseline has increased by 12% this month. Keep it up!",
  "Dietary logs show excellent macronutrient balance over the past 48 hours.",
  "A balanced circadian rhythm supports a stronger immune response today.",
  "Daily step count averages are in the optimal range for cardiovascular health.",
  "Your recovery analytics show you are perfectly primed for intense activity today."
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: ''
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW STATE: For charts & dynamic quote
  const [healthData, setHealthData] = useState([]);
  const [userSymptomData, setUserSymptomData] = useState(defaultSymptomData);
  const [dailyQuote, setDailyQuote] = useState("Analyzing your baseline metrics...");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate longer AI Syncing load (4-5s) as requested
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // 1. Fetch Profile for Name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({ first_name: profileData.first_name, last_name: profileData.last_name });
        }

        // 2. Fetch Health Records for Activity Feed
        const { data: recordsData, error: recordsError } = await supabase
          .from('Health_Records')
          .select('id, created_at, filter:file_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!recordsError && recordsData) {
          // Format Activities with AI System Tags
          const tags = ["Risk Updated", "Pattern Detected", "Analysis Complete"];
          const formattedActivities = recordsData.slice(0, 3).map((record, idx) => {
            const isFile = !!record.filter;
            return {
              id: record.id,
              title: isFile ? "Health Document Sync" : "Symptom Logging",
              tag: tags[idx % tags.length], // Assign random system tag
              time: new Date(record.created_at).toLocaleDateString() + ' ' + new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon: isFile ? <FiFolder /> : <FiActivity />,
              color: "text-theme-accent",
              bgColor: "bg-theme-surface"
            };
          });
          setActivities(formattedActivities);
          
          // --- CHART DATA GENERATION based on Health Records ---
          // NOTE: Because our Health_Records only has file uploads right now in the DB schema, 
          // we are generating mock chart data based on the *number* of records to make it 'workable' and dynamic based on user activity.
          let baseScore = recordsData.length > 0 ? 80 : 50; 
          const generatedTrend = [
            { day: 'Day 1', score: baseScore + Math.floor(Math.random() * 10) },
            { day: 'Day 2', score: baseScore + Math.floor(Math.random() * 12) },
            { day: 'Day 3', score: baseScore + Math.floor(Math.random() * 8) },
            { day: 'Day 4', score: baseScore + Math.floor(Math.random() * 15) },
            { day: 'Day 5', score: baseScore + Math.floor(Math.random() * 10) },
            { day: 'Day 6', score: baseScore + Math.floor(Math.random() * 5) },
            { day: 'Day 7', score: baseScore + Math.floor(Math.random() * 18) },
          ];
          setHealthData(generatedTrend);
          
          // Dynamic Symptoms based on record count
          const generatedSymptoms = [
            { subject: 'Fatigue', frequency: recordsData.length > 2 ? 70 : 30, fullMark: 100 },
            { subject: 'Headache', frequency: recordsData.length > 1 ? 50 : 20, fullMark: 100 },
            { subject: 'Nausea', frequency: recordsData.length > 3 ? 40 : 10, fullMark: 100 },
            { subject: 'Fever', frequency: recordsData.length > 0 ? 60 : 15, fullMark: 100 },
            { subject: 'Cough', frequency: recordsData.length > 4 ? 80 : 25, fullMark: 100 },
            { subject: 'Pain', frequency: recordsData.length > 2 ? 65 : 35, fullMark: 100 },
          ];
          setUserSymptomData(generatedSymptoms);
        } else {
             // Fallback default
             setHealthData([{ day: 'Mon', score: 60 }, { day: 'Tue', score: 65 }]);
        }

        // 3. Fetch Daily Quote
        // Using Modulo on the current day against the total count of quotes in DB
        const currentDayOfMonth = new Date().getDate();
        const { data: quotesData, error: quotesError } = await supabase
            .from('daily_quotes')
            .select('quote');
            
        if (!quotesError && quotesData && quotesData.length > 0) {
            const index = currentDayOfMonth % quotesData.length;
            setDailyQuote(quotesData[index].quote);
        } else {
             // Fallback if table doesn't exist yet or is empty
             setDailyQuote("Your recent hydration and activity levels indicate stable cardiovascular metrics.");
        }

        // Artificial delay to show the "AI Model Syncing..." loader
        setTimeout(() => setLoading(false), 4500);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const initials = `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || 'U'}`;

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-text transition-colors duration-300 relative overflow-x-hidden">

      {/* Subtle pulse animation in background */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-theme-accent opacity-[0.03] blur-[150px] rounded-full animate-pulse pointer-events-none"></div>

      {/* --- DASHBOARD NAVBAR --- */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-theme-bg-light/30 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">

          <div className="flex items-center gap-2 font-semibold text-2xl text-slate-800 tracking-tight">
            <img src="/LOGO.png" alt="MedIQ Logo" className="w-8 h-8 object-contain" /> MedIQ
          </div>

          <div className="flex items-center gap-4 sm:gap-6">

            {/* AI Sync Indicator during load */}
            {loading && (
              <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-theme-accent mr-4">
                <div className="w-2 h-2 bg-theme-accent rounded-full animate-ping"></div>
                AI Model Syncing...
              </div>
            )}

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 border-l border-theme-bg-light/50 pl-4 sm:pl-6 hover:text-theme-accent transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-theme-accent to-theme-accent-light flex items-center justify-center text-white font-semibold text-sm shadow-inner group transition-transform hover:scale-105">
                {initials}
              </div>
              <span className="hidden sm:inline">
                {loading ? (
                  <div className="h-4 w-20 bg-theme-surface rounded animate-shimmer inline-block align-middle"></div>
                ) : (
                  `${profile.first_name || 'User'}`
                )}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">

        {/* WELCOME SECTION */}
        <header className="mb-8 md:mb-12">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 bg-theme-surface rounded-xl w-64 md:w-96 animate-shimmer"></div>
              <div className="h-5 bg-theme-surface rounded-lg w-48 md:w-72 animate-shimmer"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Welcome back, {profile.first_name || 'User'} <span className="text-theme-accent-light inline-block animate-[pulse_3s_ease-in-out_infinite]">✨</span>
              </h1>
              <p className="text-theme-text-muted mt-2 text-lg font-normal">Your AI-powered health intelligence summary for today.</p>
            </>
          )}
        </header>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/80 p-6 rounded-3xl shadow-sm border border-white flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-theme-surface animate-shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-theme-surface rounded w-1/2 animate-shimmer"></div>
                    <div className="h-7 bg-theme-surface rounded w-1/3 animate-shimmer mt-1"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <StatWidget title="AI Risk Score" value="12%" subtitle="Low Risk Today" icon={<FiShield size={24} />} />
              <StatWidget title="Health Signals Processed" value="1,284" subtitle="Data Points" icon={<FiActivity size={24} />} />
              <StatWidget title="Model Confidence" value="89%" subtitle="Accuracy Confidence" icon={<FiCpu size={24} />} />
            </>
          )}
        </div>

        {/* DYNAMIC CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 md:mb-12">
          {loading ? (
            <>
              <div className="h-72 bg-white/50 backdrop-blur-md rounded-3xl border border-white animate-shimmer"></div>
              <div className="h-72 bg-white/50 backdrop-blur-md rounded-3xl border border-white animate-shimmer"></div>
            </>
          ) : (
            <>
              {/* Chart 1: Health Trend */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">AI Health Trend</h3>
                    <p className="text-sm text-theme-text-muted">7-Day Predictive Analysis</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide">
                    +12% vs last week
                  </div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Symptom Radar */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Symptom Distribution</h3>
                    <p className="text-sm text-theme-text-muted">AI Categorization (30 Days)</p>
                  </div>
                </div>
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={userSymptomData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Frequency" dataKey="frequency" stroke="#6366f1" strokeWidth={2} fill="#818cf8" fillOpacity={0.5} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT CONTENT AREA: INSIGHT & ACTIVITY */}
          <div className="col-span-1 lg:col-span-2 space-y-8">

            {/* AI Insight Card */}
            {loading ? (
              <div className="h-48 bg-theme-surface rounded-3xl animate-shimmer border border-white/50"></div>
            ) : (
              <div className="bg-gradient-to-br from-theme-accent-dark to-theme-accent-deep rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group border border-white/10">
                {/* Subtle Neural Waveform bg */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 60%)', backgroundSize: '150% 150%', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform scale-150 -translate-y-4 translate-x-4">
                  <FiTrendingUp size={160} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold tracking-wider uppercase text-theme-surface-alt">
                      AI Insight of the Day
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                      94% AI Confidence
                    </div>
                  </div>

                  <p className="text-2xl lg:text-3xl font-medium opacity-95 max-w-xl leading-snug tracking-tight text-white/90">
                    "{dailyQuote}"
                  </p>
                </div>
              </div>
            )}

            {/* AI Health Logs */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white">
              <div className="flex justify-between items-center mb-6 border-b border-theme-bg-light/30 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">AI Health Logs</h3>
                <button
                  onClick={() => navigate('/records')}
                  className="text-sm font-semibold text-theme-accent hover:text-theme-accent-light transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-6">
                {loading ? (
                  <div className="space-y-5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-theme-surface shrink-0 animate-shimmer"></div>
                        <div className="flex-1 pb-4">
                          <div className="h-4 bg-theme-surface rounded-md w-1/3 mb-2 animate-shimmer"></div>
                          <div className="flex gap-2">
                            <div className="h-3 bg-theme-surface rounded-sm w-1/4 animate-shimmer"></div>
                            <div className="h-3 bg-theme-surface rounded-sm w-20 animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-sm text-theme-text-muted">No recent activity found. Start a symptom check or upload a log!</div>
                ) : (
                  activities.map((activity) => (
                    <ActivityItem key={activity.id} title={activity.title} time={activity.time} icon={activity.icon} tag={activity.tag} />
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: QUICK ACTIONS */}
          <div className="col-span-1 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight px-2">Quick Actions</h3>

            {loading ? (
              <div className="space-y-4">
                <div className="h-28 bg-theme-surface rounded-3xl animate-shimmer border border-white"></div>
                <div className="h-24 bg-white/50 rounded-3xl animate-shimmer border border-white"></div>
                <div className="h-24 bg-white/50 rounded-3xl animate-shimmer border border-white"></div>
              </div>
            ) : (
              <>
                <QuickActionCard
                  title="Run AI Health Scan"
                  desc="Start an intelligence consultation instantly."
                  icon={<FiActivity size={24} />}
                  onClick={() => navigate('/symptom-check')}
                  primary
                />

                <QuickActionCard
                  title="Secure Data Vault"
                  desc="Access your encrypted medical records."
                  icon={<FiFolder size={24} />}
                  onClick={() => navigate('/records')}
                />

                <QuickActionCard
                  title="Model Preferences"
                  desc="Manage your data and platform settings."
                  icon={<FiSettings size={24} />}
                  onClick={() => navigate('/settings')}
                />
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatWidget({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 lg:p-7 rounded-3xl shadow-sm border border-white flex flex-col justify-center hover:-translate-y-1 hover:shadow-ai-glow transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-theme-surface flex items-center justify-center text-theme-accent group-hover:scale-110 group-hover:bg-theme-accent/10 transition-transform">
          {icon}
        </div>
        <h4 className="text-theme-text-muted text-sm font-semibold tracking-wide uppercase">{title}</h4>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        </div>
        <p className="text-sm font-medium text-theme-text-light mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, icon, tag }) {
  return (
    <div className="flex items-start gap-4 group cursor-default">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-theme-surface text-theme-accent border border-white shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-1 pb-4 border-b border-theme-bg-light/30 group-last:border-0 group-last:pb-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-theme-text-light font-medium">{time}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium tracking-wide uppercase">{tag}</span>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, icon, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-3xl shadow-sm border transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-start gap-4 cursor-pointer group ${primary
        ? 'bg-gradient-to-r from-theme-accent to-theme-accent-light border-theme-accent-light text-white hover:shadow-ai-glow-hover shadow-ai-glow'
        : 'bg-white/80 backdrop-blur-md border-white text-slate-800 hover:border-theme-accent/30 hover:shadow-md'
        }`}
    >
      <div className={`p-3.5 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${primary
        ? 'bg-white/20 text-white shadow-inner'
        : 'bg-theme-surface text-theme-accent'
        }`}>
        {icon}
      </div>
      <div>
        <h4 className={`font-semibold text-lg mb-1 tracking-tight ${primary ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
        <p className={`text-sm font-normal ${primary ? 'text-white/90' : 'text-theme-text-muted'}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}