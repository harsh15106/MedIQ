import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiFileText, FiTrash2, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { supabase } from '../utils/SupabaseClient';

export default function HealthRecords() {
  const navigate = useNavigate();

  // 1. STATE FOR PAST DATA (Fetched from DB)
  const [profileData, setProfileData] = useState({
    conditions: "Loading...",
    medications: "Loading...",
    allergies: "Loading...",
    surgeries: "Loading...",
    lastUpdated: "--"
  });

  const [pastDocuments, setPastDocuments] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Fetch data when component mounts
  useEffect(() => {
    fetchProfileAndRecords();
  }, []);

  const fetchProfileAndRecords = async () => {
    try {
      setIsFetchingData(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return; // Let handleSubmit handle redirects if not auth'd

      // 1. Fetch Profile Data
      const { data: profileObj, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileErr && profileObj) {
        setProfileData({
          conditions: profileObj.chronic_conditions || "Not provided",
          medications: profileObj.current_medications || "Not provided",
          allergies: profileObj.allergies || "Not provided",
          surgeries: profileObj.surgeries || "Not provided",
          lastUpdated: profileObj.updated_at
            ? new Date(profileObj.updated_at).toLocaleDateString()
            : "Unknown"
        });
      } else {
        setProfileData({
          conditions: "Not provided",
          medications: "Not provided",
          allergies: "Not provided",
          surgeries: "Not provided",
          lastUpdated: "Never"
        });
      }

      // 2. Fetch Past Documents from Health_Records
      const { data: recordsData, error: recordsErr } = await supabase
        .from('Health_Records')
        .select('*')
        .eq('user_id', user.id)
        .not('file_path', 'is', null) // Only get records that have a file attached
        .order('created_at', { ascending: false });

      if (!recordsErr && recordsData) {
        setPastDocuments(recordsData);
      }

    } catch (err) {
      console.error("Error fetching health data:", err);
    } finally {
      setIsFetchingData(false);
    }
  };

  // 2. STATE FOR NEW UPLOADS & NOTES
  const [newFile, setNewFile] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [healthMetrics, setHealthMetrics] = useState({
    bloodGlucose: '',
    hbA1c: '',
    systolicBP: '',
    diastolicBP: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
    haemoglobin: '',
    mcv: ''
  });

  // 3. STATE FOR AI INSIGHTS FROM BACKEND
  const [modelInsights, setModelInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewFile(file);
  };

  const handleRemoveFile = () => setNewFile(null);

  const handleMetricChange = (e) => {
    setHealthMetrics({ ...healthMetrics, [e.target.name]: e.target.value });
  };

  const handleSubmitNewRecord = async (e) => {
    e.preventDefault();

    try {
      // 1. Get the current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Session expired. Please sign in again.");
        navigate('/login');
        return;
      }

      // 2. Handle File Upload (if a file exists)
      let fileUrl = null;
      if (newFile) {
        const fileExt = newFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`; // Folder name MUST match user.id for RLS policies

        const { error: uploadError } = await supabase.storage
          .from('medical_reports') // Ensure this bucket exists in your Supabase project
          .upload(filePath, newFile);

        if (uploadError) throw uploadError;
        fileUrl = filePath;
      }

      // 3. Insert a new row into the Health_Records table
      const { error: insertError } = await supabase
        .from('Health_Records')
        .insert([{
          user_id: user.id,
          additional_notes: newNote,
          file_path: fileUrl,

          chronic_conditions: null,
          current_medications: null,
          allergies: null,
          surgeries: null,

          blood_glucose: healthMetrics.bloodGlucose ? parseFloat(healthMetrics.bloodGlucose) : null,
          hba1c: healthMetrics.hbA1c ? parseFloat(healthMetrics.hbA1c) : null,
          systolic_bp: healthMetrics.systolicBP ? parseFloat(healthMetrics.systolicBP) : null,
          diastolic_bp: healthMetrics.diastolicBP ? parseFloat(healthMetrics.diastolicBP) : null,
          ldl: healthMetrics.ldl ? parseFloat(healthMetrics.ldl) : null,
          hdl: healthMetrics.hdl ? parseFloat(healthMetrics.hdl) : null,
          triglycerides: healthMetrics.triglycerides ? parseFloat(healthMetrics.triglycerides) : null,
          haemoglobin: healthMetrics.haemoglobin ? parseFloat(healthMetrics.haemoglobin) : null,
          mcv: healthMetrics.mcv ? parseFloat(healthMetrics.mcv) : null,
        }]);

      if (insertError) throw insertError;

      // 4. Send Metrics to the Backend Health Model
      if (healthMetrics.bloodGlucose || healthMetrics.systolicBP || healthMetrics.hbA1c || healthMetrics.ldl) {
        setIsAnalyzing(true);
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const modelResponse = await fetch(`${apiUrl}/api/analyze-health`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blood_glucose: healthMetrics.bloodGlucose ? parseFloat(healthMetrics.bloodGlucose) : null,
              hba1c: healthMetrics.hbA1c ? parseFloat(healthMetrics.hbA1c) : null,
              systolic_bp: healthMetrics.systolicBP ? parseFloat(healthMetrics.systolicBP) : null,
              diastolic_bp: healthMetrics.diastolicBP ? parseFloat(healthMetrics.diastolicBP) : null,
              ldl: healthMetrics.ldl ? parseFloat(healthMetrics.ldl) : null,
              hdl: healthMetrics.hdl ? parseFloat(healthMetrics.hdl) : null,
              triglycerides: healthMetrics.triglycerides ? parseFloat(healthMetrics.triglycerides) : null,
              haemoglobin: healthMetrics.haemoglobin ? parseFloat(healthMetrics.haemoglobin) : null,
              mcv: healthMetrics.mcv ? parseFloat(healthMetrics.mcv) : null,
            })
          });

          if (modelResponse.ok) {
            const result = await modelResponse.json();
            if (result.success && result.analysis) {
              setModelInsights(result.analysis);
              toast.success("AI Analysis Complete!");
            }
          }
        } catch (modelError) {
          console.error("Failed to reach AI Backend:", modelError);
          toast.error("Saved record, but couldn't reach AI Model.");
        } finally {
          setIsAnalyzing(false);
        }
      }

      // 5. Reset form after successful submission
      setNewFile(null);
      setNewNote('');
      setHealthMetrics({
        bloodGlucose: '',
        hbA1c: '',
        systolicBP: '',
        diastolicBP: '',
        ldl: '',
        hdl: '',
        triglycerides: '',
        haemoglobin: '',
        mcv: ''
      });
      if (!modelInsights && !isAnalyzing) toast.success("Record saved to your secure vault!");

      // 6. Refresh Data display instantly
      fetchProfileAndRecords();

    } catch (error) {
      console.error("Error saving record:", error);
      toast.error(error.message || "Failed to save record.");
    }
  };

  const handleDocumentDelete = (docId, filePath) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-slate-800 ">Are you sure you want to delete this document permanently?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-slate-600  hover:bg-slate-100  rounded-md transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                if (filePath) {
                  const { error: storageError } = await supabase.storage
                    .from('medical_reports')
                    .remove([filePath]);
                  if (storageError) throw storageError;
                }
                const { error: dbError } = await supabase
                  .from('Health_Records')
                  .update({ file_path: null })
                  .eq('id', docId);
                if (dbError) throw dbError;
                toast.success("Document deleted successfully");
                fetchProfileAndRecords();
              } catch (err) {
                console.error("Deletion error:", err);
                toast.error("Failed to delete document");
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: docId });
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-300 pb-12 font-sans relative overflow-x-hidden">

      {/* Abstract light burst bg */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-theme-accent opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-theme-accent-dark opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-theme-bg-light/30 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-theme-text-muted hover:text-theme-accent bg-theme-surface hover:bg-theme-bg-light/30 rounded-full transition cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Health Data Vault</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ==========================================
              LEFT COLUMN: PAST REPORTS & HISTORY
              ========================================== */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 px-1">Medical Profile</h2>

            <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white transition-all hover:border-theme-accent/30 hover:shadow-md">
              {isFetchingData ? (
                <div className="animate-pulse space-y-5">
                  <div className="flex items-center gap-2 text-sm text-theme-text/60 font-light mb-6 pb-4 border-b border-theme-surface">
                    <FiClock /> Last updated: ...
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-theme-bg-light/30 rounded mb-2"></div>
                    <div className="h-4 w-48 bg-theme-surface rounded"></div>
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-theme-bg-light/30 rounded mb-2"></div>
                    <div className="h-4 w-48 bg-theme-surface rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-3 w-24 bg-theme-bg-light/30 rounded mb-2"></div>
                      <div className="h-4 w-32 bg-theme-surface rounded"></div>
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-theme-bg-light/30 rounded mb-2"></div>
                      <div className="h-4 w-32 bg-theme-surface rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-theme-text/60 font-light mb-6 pb-4 border-b border-theme-surface">
                    <FiClock /> Last updated: {profileData.lastUpdated}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-wider mb-1">Chronic Conditions</h3>
                      <p className="font-medium text-slate-800">{profileData.conditions}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-wider mb-1">Current Medications</h3>
                      <p className="font-medium text-slate-800">{profileData.medications}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-wider mb-1">Allergies</h3>
                        <p className="font-medium text-slate-800">{profileData.allergies}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-wider mb-1">Surgeries</h3>
                        <p className="font-medium text-slate-800">{profileData.surgeries}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Display Previously Uploaded Documents */}
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 mt-8 mb-4 px-1">Secured Documents</h3>
            <div className="space-y-3">
              {isFetchingData ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-theme-bg-light/20 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-theme-surface rounded-2xl w-12 h-12"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-theme-bg-light/30 rounded"></div>
                          <div className="h-2 w-24 bg-theme-surface rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pastDocuments.length === 0 ? (
                <div className="bg-theme-surface p-6 rounded-[1.5rem] border border-dashed border-theme-bg-light/30 text-center text-sm text-theme-text/80 font-light">
                  No documents uploaded yet.
                </div>
              ) : (
                pastDocuments.map((doc, idx) => {
                  const fileName = doc.file_path ? doc.file_path.split('/').pop() : "Unnamed Document";
                  // Extract original file name without user ID hash if it follows `user.id-random.ext` pattern
                  const cleanName = fileName.includes('-') ? fileName.split('-').slice(1).join('-') : fileName;

                  return (
                    <div key={idx} className="group bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white flex items-center justify-between transition hover:shadow-md hover:border-theme-accent/30 cursor-default">
                      <div className="flex items-center gap-3 overflow-hidden pr-4">
                        <div className="p-3 bg-theme-surface rounded-2xl text-theme-accent shrink-0 transition-colors group-hover:bg-theme-bg-light/20">
                          <FiFileText className="text-xl" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-800 truncate">{cleanName}</p>
                          <p className="text-xs text-theme-text/60 font-light mt-0.5">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={async () => {
                            const { data, error } = await supabase.storage.from('medical_reports').createSignedUrl(doc.file_path, 3600); // URL valid for 1 hour
                            if (error) {
                              toast.error("Error accessing file: " + error.message);
                              return;
                            }
                            if (data && data.signedUrl) {
                              window.open(data.signedUrl, '_blank');
                            }
                          }}
                          className="text-sm font-medium text-theme-accent hover:opacity-80 cursor-pointer transition-opacity"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDocumentDelete(doc.id, doc.file_path)}
                          className="p-1.5 text-theme-text/40 hover:text-red-400 hover:bg-red-50 rounded-md transition cursor-pointer"
                          title="Delete Document"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* AI HEALTH MODEL INSIGHTS UI */}
            {modelInsights && (
              <div className="mt-8 animate-fade-in bg-theme-bg-light/10 p-6 md:p-8 rounded-[2rem] border border-theme-bg-light/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 transform scale-150 -translate-y-4 translate-x-4 pointer-events-none">
                  <FiClock className="text-6xl text-theme-accent" />
                </div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 bg-theme-accent text-white rounded-[1rem] shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 tracking-tight">MedIQ AI Insight</h3>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-theme-text/80">Determined Risk Level:</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${modelInsights.riskLevel === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                      modelInsights.riskLevel === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                        'bg-theme-bg-light/30 text-theme-accent border border-theme-accent/20'
                      }`}>
                      {modelInsights.riskLevel}
                    </span>
                  </div>

                  <ul className="space-y-2 mt-4">
                    {modelInsights.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-theme-text/80 leading-relaxed font-light">
                        <span className="text-theme-accent mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setModelInsights(null)}
                  className="mt-6 text-xs font-medium text-theme-accent hover:opacity-80 transition-opacity cursor-pointer border-b border-theme-accent/30 pb-0.5"
                >
                  Dismiss Insight
                </button>
              </div>
            )}
          </div>


          {/*RIGHT COLUMN: ADD NEW RECORD */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 px-1">Add New Record</h2>

            <form
              onSubmit={handleSubmitNewRecord}
              className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white space-y-6 transition-all hover:shadow-md hover:border-theme-accent/20"
            >
              {/* PDF / Image Upload Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Upload Report (Lab results, prescriptions, etc.)
                </label>

                <div className="border-2 border-dashed border-theme-bg-light/30 rounded-[1.5rem] bg-theme-surface p-6 text-center transition-colors">
                  {!newFile ? (
                    <>
                      <FiUploadCloud className="mx-auto text-3xl text-theme-accent mb-3" />
                      <p className="text-sm text-theme-text/80 font-light mb-4">Drag and drop or click to browse</p>
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-theme-bg-light/20 rounded-[1rem] shadow-sm text-sm font-medium text-theme-text bg-white hover:bg-theme-surface transition">
                        Select File
                        <input type="file" className="hidden" onChange={handleFileChange} />
                      </label>
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-4 border border-theme-bg-light/20 rounded-[1rem] shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FiFileText className="text-2xl text-theme-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {newFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2 text-theme-text/60 hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lab Results & Vitals */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Lab Results & Vitals (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Blood glucose", name: "bloodGlucose", placeholder: "mg/dL" },
                    { label: "HbA1C", name: "hbA1c", placeholder: "%" },
                    { label: "Systolic BP", name: "systolicBP", placeholder: "mmHg" },
                    { label: "Diastolic BP", name: "diastolicBP", placeholder: "mmHg" },
                    { label: "LDL", name: "ldl", placeholder: "mg/dL" },
                    { label: "HDL", name: "hdl", placeholder: "mg/dL" },
                    { label: "Triglycerides", name: "triglycerides", placeholder: "mg/dL" },
                    { label: "Haemoglobin", name: "haemoglobin", placeholder: "g/dL" },
                    { label: "MCV", name: "mcv", placeholder: "fL" },
                  ].map((field) => (
                    <div key={field.name}>
                      <span className="block text-xs font-medium text-theme-text/80 mb-1">{field.label}</span>
                      <input
                        type="number"
                        step="any"
                        name={field.name}
                        value={healthMetrics[field.name]}
                        onChange={handleMetricChange}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors text-sm placeholder:text-slate-400 font-light text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Input Note Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes or Details
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none shadow-sm transition-colors resize-none placeholder:text-slate-400 font-light text-slate-700"
                  placeholder="e.g., Doctor advised lowering sodium intake after reviewing these latest results..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full font-semibold shadow-ai-glow hover:shadow-ai-glow-hover active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with MedIQ AI...
                  </>
                ) : (
                  "Save & Analyze Record"
                )}
              </button>
            </form>

          </div>
        </div>
      </main>

    </div>
  );
}