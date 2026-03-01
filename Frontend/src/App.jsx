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

  // Dark mode is globally removed.

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
            },
            success: {
              style: { background: '#2563eb', color: 'white' }, // blue-600
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
            <div className="flex flex-col items-center justify-center min-h-screen ">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">404</h1>
              <p className="text-slate-600 ">Oops! The page you're looking for doesn't exist.</p>
              <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
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