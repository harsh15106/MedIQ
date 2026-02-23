import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiFileText, FiTrash2, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function HealthRecords() {
  const navigate = useNavigate();

  // 1. DUMMY PAST DATA (This simulates what they entered in Onboarding)
  const pastProfile = {
    conditions: "Mild Asthma",
    medications: "Albuterol Inhaler (as needed), Vitamin D3",
    allergies: "Penicillin",
    surgeries: "None",
    lastUpdated: "Oct 24, 2023"
  };

  // 2. STATE FOR NEW UPLOADS & NOTES
  const [newFile, setNewFile] = useState(null);
  const [newNote, setNewNote] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewFile(file);
  };

  const handleRemoveFile = () => setNewFile(null);

  const handleSubmitNewRecord = (e) => {
    e.preventDefault();
    console.log("Submitting New Record...");
    console.log("File:", newFile ? newFile.name : "No file attached");
    console.log("Note:", newNote);
    
    // Reset form after submission
    setNewFile(null);
    setNewNote('');
    toast.success("Record saved to your secure vault!");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-12">
      
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Health Records</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ==========================================
              LEFT COLUMN: PAST REPORTS & HISTORY
              ========================================== */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Medical Profile</h2>
            
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <FiClock /> Last updated during onboarding ({pastProfile.lastUpdated})
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Chronic Conditions</h3>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{pastProfile.conditions}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Current Medications</h3>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{pastProfile.medications}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Allergies</h3>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{pastProfile.allergies}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Surgeries</h3>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{pastProfile.surgeries}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Example of a previously uploaded document */}
            <h3 className="text-lg font-bold mt-8 mb-4">Past Documents</h3>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                  <FiFileText className="text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Annual_Blood_Test_2023.pdf</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded Oct 24, 2023</p>
                </div>
              </div>
              <button className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">View</button>
            </div>
          </div>


          {/*RIGHT COLUMN: ADD NEW RECORD */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Add New Record</h2>
            
            <form 
              onSubmit={handleSubmitNewRecord}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
            >
              {/* PDF / Image Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Upload Report (Lab results, prescriptions, etc.)
                </label>
                
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950/50 p-6 text-center transition-colors">
                  {!newFile ? (
                    <>
                      <FiUploadCloud className="mx-auto text-3xl text-teal-500 mb-3" />
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Drag and drop or click to browse</p>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        Select File
                        <input type="file" className="hidden" onChange={handleFileChange} />
                      </label>
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 border border-teal-200 dark:border-teal-900 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FiFileText className="text-2xl text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          {newFile.name}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveFile}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Input Note Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Additional Notes or Details
                </label>
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows="4" 
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="e.g., Doctor advised lowering sodium intake after reviewing these latest results..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-md cursor-pointer"
              >
                Save Record to Vault
              </button>
            </form>

          </div>
        </div>
      </main>

    </div>
  );
}