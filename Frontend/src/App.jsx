import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/Authpage';
import Dashboard from './pages/Dashboard';
import MedicalProfile from './pages/MedicalProfile'; 
import HealthRecords from './pages/HealthRecords';
import SymptomCheck from './pages/SymptomCheck';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Add the new Onboarding Route */}
          <Route path="/onboarding" element={<MedicalProfile />} /> 
          
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/symptom-check" element={<SymptomCheck />} />

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