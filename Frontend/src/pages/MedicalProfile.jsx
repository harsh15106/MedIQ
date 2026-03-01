import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFileText, FiTrash2 } from 'react-icons/fi'; // Import icons for the upload area
import { supabase } from '../utils/SupabaseClient'; // Ensure the path matches your folder structure
import toast from 'react-hot-toast';
export default function MedicalProfile() {
  const navigate = useNavigate();

  // State for manual text inputs
  const [medicalData, setMedicalData] = useState({
    conditions: '',
    medications: '',
    allergies: '',
    surgeries: '',
    weight: '',
    height: '',
    gender: ''
  });

  // State to hold the uploaded PDF file
  const [pdfFile, setPdfFile] = useState(null);

  const handleChange = (e) => {
    setMedicalData({ ...medicalData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };

  // Handle removing the selected file
  const removeFile = () => {
    setPdfFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Get the current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Session expired. Please sign in again.");
        navigate('/login');
        return;
      }

      // 2. Handle PDF Upload (if a file exists)
      let pdfUrl = null;
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('medical-records') // Make sure you create this bucket in Supabase!
          .upload(filePath, pdfFile);

        if (uploadError) throw uploadError;
        pdfUrl = filePath;
      }

      // 3. Update the 'profiles' table with manual data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          chronic_conditions: medicalData.conditions,
          current_medications: medicalData.medications,
          known_allergies: medicalData.allergies,
          past_surgeries: medicalData.surgeries,
          weight: medicalData.weight ? Number(medicalData.weight) : null,
          height: medicalData.height ? Number(medicalData.height) : null,
          gender: medicalData.gender || null
          // profile_report_path: pdfUrl, // Uncomment if you add this column
        })
        .eq('id', user.id); // Ensures we update the correct user

      if (updateError) throw updateError;

      toast.success("Medical profile saved successfully!");
      navigate('/dashboard');

    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSkip = () => {
    // Allow users to skip and fill it out later
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-theme-bg py-12 px-4 sm:px-6 lg:px-8 font-sans text-theme-text transition-colors duration-300 relative overflow-hidden">

      {/* Abstract light burst bg */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-theme-accent opacity-[0.03] blur-[150px] rounded-full mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-white/40 backdrop-blur-md text-theme-accent px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white tracking-widest uppercase">
            Step 2 of 2: Medical Initialization
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-3">
            Help the AI understand you
          </h1>
          <p className="text-theme-text-muted text-lg max-w-xl mx-auto font-normal">
            Upload your existing health records or fill out the form below so MedIQ can provide precise predictive insights.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-6 md:p-10 transition-colors duration-300">

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* --- PDF UPLOAD SECTION --- */}
            <div className="p-6 border-2 border-dashed border-theme-bg-light/30 rounded-[1.5rem] bg-theme-surface text-center transition-colors">
              {!pdfFile ? (
                <>
                  <FiUploadCloud className="mx-auto text-4xl text-theme-accent mb-3" />
                  <h3 className="text-base font-medium text-slate-800 mb-1 tracking-tight">Upload Medical Records</h3>
                  <p className="text-sm text-theme-text/80 font-light mb-4">Fastest option: Upload a PDF of your clinic notes, lab results, or history.</p>
                  <label className="cursor-pointer inline-flex items-center justify-center px-5 py-2.5 border border-theme-bg-light/20 rounded-[1rem] shadow-sm text-sm font-medium text-theme-text bg-white hover:bg-theme-surface transition">
                    Browse Files
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                  <p className="text-xs text-slate-400 mt-3 font-light">PDF up to 10MB</p>
                </>
              ) : (
                /* State when file is uploaded */
                <div className="flex items-center justify-between bg-white p-4 border border-theme-bg-light/20 rounded-[1rem] shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-theme-surface rounded-lg text-theme-accent">
                      <FiFileText className="text-xl" />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-sm font-medium text-slate-800 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-theme-text/60 font-light">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-theme-text/60 hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                    title="Remove File"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* --- DIVIDER --- */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-theme-bg-light/20"></div>
              <span className="flex-shrink-0 mx-4 text-theme-text/40 text-xs font-semibold uppercase tracking-widest">
                OR FILL MANUALLY
              </span>
              <div className="flex-grow border-t border-theme-bg-light/20"></div>
            </div>

            {/* --- MANUAL INPUT FIELDS --- */}
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={medicalData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors font-light text-slate-700"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={medicalData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors font-light text-slate-700"
                    placeholder="e.g. 175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={medicalData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors font-light text-slate-700"
                    placeholder="e.g. 70"
                  />
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chronic Conditions or Illnesses
                </label>
                <textarea
                  name="conditions"
                  value={medicalData.conditions}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 font-light text-slate-700"
                  placeholder="e.g., Asthma, Diabetes, Hypertension..."
                ></textarea>
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  name="medications"
                  value={medicalData.medications}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 font-light text-slate-700"
                  placeholder="e.g., Lisinopril 10mg daily, Vitamin D..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Known Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={medicalData.allergies}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 font-light text-slate-700"
                    placeholder="e.g., Penicillin, Peanuts..."
                  ></textarea>
                </div>

                {/* Past Surgeries */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Past Surgeries
                  </label>
                  <textarea
                    name="surgeries"
                    value={medicalData.surgeries}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 font-light text-slate-700"
                    placeholder="e.g., Appendectomy (2015)..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* --- BUTTONS --- */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-theme-bg-light/20">
              <button
                type="button"
                onClick={handleSkip}
                className="text-theme-text-muted hover:text-theme-accent font-semibold transition-colors order-2 sm:order-1 cursor-pointer"
              >
                Skip for now
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full font-semibold shadow-ai-glow hover:shadow-ai-glow-hover active:scale-95 transition-all duration-300 order-1 sm:order-2 cursor-pointer flex justify-center items-center"
              >
                Save & Initialize AI
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}