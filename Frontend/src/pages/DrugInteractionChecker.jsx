import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiX, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiPlus, FiShield, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_CONFIG = {
  Severe: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-500 text-white',
    icon: <FiAlertTriangle className="text-lg" />,
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
  },
  Moderate: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-500 text-white',
    icon: <FiAlertCircle className="text-lg" />,
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
  },
  Mild: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-500 text-white',
    icon: <FiCheckCircle className="text-lg" />,
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
  }
};

export default function DrugInteractionChecker() {
  const navigate = useNavigate();

  const [drugList, setDrugList] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [interactions, setInteractions] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch drug list on mount
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const res = await fetch('http://localhost:5000/drugs');
        const data = await res.json();
        setDrugList(data);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
        // Fallback static list
        setDrugList([
          { name: "Ibuprofen", class: "NSAID", group: "pain" },
          { name: "Metformin", class: "Biguanide", group: "diabetes" },
          { name: "Lisinopril", class: "ACE inhibitor", group: "hypertension" },
          { name: "Amlodipine", class: "Calcium channel blocker", group: "hypertension" },
          { name: "Omeprazole", class: "Proton pump inhibitor", group: "gi" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrugs();
  }, []);

  const filteredDrugs = drugList.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedDrugs.find(s => s.name === d.name)
  );

  const addDrug = (drug) => {
    setSelectedDrugs(prev => [...prev, drug]);
    setSearchQuery('');
    setShowDropdown(false);
    setInteractions(null); // Clear old results
  };

  const removeDrug = (drugName) => {
    setSelectedDrugs(prev => prev.filter(d => d.name !== drugName));
    setInteractions(null); // Clear old results
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    setIsChecking(true);
    try {
      const res = await fetch('http://localhost:5000/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: selectedDrugs.map(d => d.name) })
      });
      const data = await res.json();
      setInteractions(data);
    } catch (err) {
      console.error("Error checking interactions:", err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden">

      {/* Ambient Background */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-blue-400 opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-indigo-400 opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Drug Interaction Checker</h1>
            <p className="text-xs text-blue-600 font-semibold tracking-wide uppercase opacity-80">AI-Powered Safety Analysis</p>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">

        {/* Instructions Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 60%)' }}></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0">
              <FiShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Check Drug Safety</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Select your current medications below to check for potentially dangerous drug-drug interactions.
                Our database covers 30+ known clinical interactions.
              </p>
            </div>
          </div>
        </div>

        {/* Drug Selector */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white p-6 md:p-8 mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">Your Medications</h3>

          {/* Selected Drug Chips */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[44px]">
            <AnimatePresence>
              {selectedDrugs.map(drug => (
                <motion.div
                  key={drug.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium group"
                >
                  <span>{drug.name}</span>
                  <button
                    onClick={() => removeDrug(drug.name)}
                    className="p-0.5 rounded-full hover:bg-blue-200 transition cursor-pointer"
                  >
                    <FiX className="text-sm" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedDrugs.length === 0 && (
              <p className="text-sm text-slate-400 italic self-center">No medications selected yet. Search below to add.</p>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2 border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 transition-colors bg-white">
              <FiSearch className="text-slate-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search medications (e.g., Ibuprofen, Metformin)..."
                className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && searchQuery.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-sm text-slate-400 text-center">Loading drugs...</div>
                ) : filteredDrugs.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">No matching medications found.</div>
                ) : (
                  filteredDrugs.map((drug, idx) => (
                    <button
                      key={idx}
                      onClick={() => addDrug(drug)}
                      className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{drug.name}</p>
                        <p className="text-xs text-slate-400">{drug.class} • {drug.group}</p>
                      </div>
                      <FiPlus className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Check Button */}
          <button
            onClick={checkInteractions}
            disabled={selectedDrugs.length < 2 || isChecking}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
          >
            {isChecking ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Interactions...
              </>
            ) : (
              <>
                <FiZap className="text-xl" />
                {selectedDrugs.length < 2 ? 'Select at least 2 medications' : `Check ${selectedDrugs.length} Medications`}
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {interactions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary Banner */}
              <div className={`rounded-3xl p-6 mb-6 border ${interactions.interactions_found > 0
                ? 'bg-red-50/50 border-red-200/50'
                : 'bg-emerald-50/50 border-emerald-200/50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${interactions.interactions_found > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {interactions.interactions_found > 0 ? <FiAlertTriangle className="text-2xl" /> : <FiCheckCircle className="text-2xl" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {interactions.interactions_found > 0
                        ? `${interactions.interactions_found} Interaction${interactions.interactions_found > 1 ? 's' : ''} Found`
                        : 'No Interactions Detected'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {interactions.interactions_found > 0
                        ? 'Please review the details below and consult with your healthcare provider.'
                        : 'No known interactions between your selected medications were found in our database.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interaction Cards */}
              <div className="space-y-4">
                {interactions.interactions.map((inter, idx) => {
                  const config = SEVERITY_CONFIG[inter.severity] || SEVERITY_CONFIG.Mild;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className={`${config.bg} ${config.border} ${config.glow} border rounded-3xl p-6 transition-all hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${config.badge}`}>
                            {config.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">
                              {inter.drug_a} <span className="text-slate-400 mx-1">×</span> {inter.drug_b}
                            </h4>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
                          {inter.severity}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed mb-3">{inter.description}</p>

                      <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
                        <p className="text-sm text-slate-700 font-medium">{inter.recommendation}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                  ⚠ This tool is for informational purposes only. Always consult your physician before changing medications.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
