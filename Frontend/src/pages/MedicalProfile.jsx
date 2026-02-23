import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFileText, FiTrash2 } from 'react-icons/fi'; // Import icons for the upload area

export default function MedicalProfile() {
  const navigate = useNavigate();
  
  // State for manual text inputs
  const [medicalData, setMedicalData] = useState({
    conditions: '',
    medications: '',
    allergies: '',
    surgeries: '',
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
      alert('Please upload a valid PDF file.');
    }
  };

  // Handle removing the selected file
  const removeFile = () => {
    setPdfFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved Medical Profile Data:", medicalData);
    if (pdfFile) {
      console.log("Uploaded PDF File:", pdfFile.name);
    }
    // After saving the data/file, send them to the dashboard
    navigate('/dashboard');
  };

  const handleSkip = () => {
    // Allow users to skip and fill it out later
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 transition-colors duration-300">
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-teal-100 dark:bg-slate-800 text-teal-800 dark:text-teal-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-sm border border-teal-200 dark:border-slate-700">
            Step 2 of 2: Medical History
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Help our AI understand you
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Upload your existing health records or fill out the form below so MedIQ can provide personalized, accurate insights.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 transition-colors duration-300">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* --- PDF UPLOAD SECTION --- */}
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-center transition-colors">
              {!pdfFile ? (
                <>
                  <FiUploadCloud className="mx-auto text-4xl text-teal-500 mb-3" />
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">Upload Medical Records</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Fastest option: Upload a PDF of your clinic notes, lab results, or history.</p>
                  <label className="cursor-pointer inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    Browse Files
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                  <p className="text-xs text-slate-400 mt-3">PDF up to 10MB</p>
                </>
              ) : (
                /* State when file is uploaded */
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 border border-teal-200 dark:border-teal-900 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                      <FiFileText className="text-xl" />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{pdfFile.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Remove File"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* --- DIVIDER --- */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                OR FILL MANUALLY
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* --- MANUAL INPUT FIELDS --- */}
            <div className="space-y-6">
              {/* Chronic Conditions */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Chronic Conditions or Illnesses
                </label>
                <textarea 
                  name="conditions"
                  value={medicalData.conditions}
                  onChange={handleChange}
                  rows="2" 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="e.g., Asthma, Diabetes, Hypertension..."
                ></textarea>
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Current Medications
                </label>
                <textarea 
                  name="medications"
                  value={medicalData.medications}
                  onChange={handleChange}
                  rows="2" 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="e.g., Lisinopril 10mg daily, Vitamin D..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Known Allergies
                  </label>
                  <textarea 
                    name="allergies"
                    value={medicalData.allergies}
                    onChange={handleChange}
                    rows="2" 
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="e.g., Penicillin, Peanuts..."
                  ></textarea>
                </div>

                {/* Past Surgeries */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Past Surgeries
                  </label>
                  <textarea 
                    name="surgeries"
                    value={medicalData.surgeries}
                    onChange={handleChange}
                    rows="2" 
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="e.g., Appendectomy (2015)..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* --- BUTTONS --- */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button" 
                onClick={handleSkip}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition order-2 sm:order-1  cursor-pointer"
              >
                Skip for now
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-md order-1 sm:order-2 cursor-pointer"
              >
                Save & Continue
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}