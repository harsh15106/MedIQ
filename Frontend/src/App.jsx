import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/Authpage';
import Dashboard from './pages/Dashboard';
import MedicalProfile from './pages/MedicalProfile';
import HealthRecords from './pages/HealthRecords';
import SymptomCheck from './pages/SymptomCheck';
import { Toaster } from 'react-hot-toast';
import ProfileSettings from './pages/ProfileSettings';


console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY)

function App() {

  // Enforce dark mode on global app load/refresh
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark'; // ensure it's set
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#334155', // slate-700
              color: '#fff',
            },
            success: {
              style: { background: '#0d9488', color: 'white' }, // teal-600
            },
            error: {
              style: { background: '#ef4444', color: 'white' }, // red-500
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Add the new Onboarding Route */}
          <Route path="/onboarding" element={<MedicalProfile />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/symptom-check" element={<SymptomCheck />} />
          <Route path="/settings" element={<ProfileSettings />} />

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen dark:bg-slate-950">
              <h1 className="text-4xl font-bold text-teal-600 mb-4">404</h1>
              <p className="text-slate-600 dark:text-slate-400">Oops! The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                Go back home
              </a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;