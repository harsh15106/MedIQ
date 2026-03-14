import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Pill, AlertTriangle, CheckCircle, Search, Plus, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COMMON_DRUGS = [
  "paracetamol", "acetaminophen", "tylenol", "panadol", "ibuprofen", "advil", "motrin", "nurofen",
  "aspirin", "acetylsalicylic acid", "disprin", "naproxen", "aleve", "diclofenac", "voltaren",
  "amoxicillin", "amoxil", "azithromycin", "zithromax", "z-pak", "ciprofloxacin", "cipro",
  "doxycycline", "vibramycin", "cephalexin", "keflex", "omeprazole", "prilosec", "losec",
  "pantoprazole", "protonix", "famotidine", "pepcid", "ondansetron", "zofran", "loperamide", "imodium",
  "cetirizine", "zyrtec", "loratadine", "claritin", "diphenhydramine", "benadryl", "amlodipine", "norvasc",
  "lisinopril", "prinivil", "zestril", "losartan", "cozaar", "metoprolol", "lopressor", "toprol",
  "atorvastatin", "lipitor", "simvastatin", "zocor", "metformin", "glucophage", "albuterol",
  "salbutamol", "ventolin", "sertraline", "zoloft", "escitalopram", "lexapro", "alprazolam", "xanax",
  "zolpidem", "ambien"
];

const DrugConflict = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const filteredDrugs = searchTerm.length > 0 
    ? COMMON_DRUGS.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedDrugs.includes(d))
    : [];

  const addDrug = (drug) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug]);
      setSearchTerm('');
      setResults(null);
    }
  };

  const handleCustomAdd = () => {
    if (searchTerm.trim() && !selectedDrugs.includes(searchTerm.trim())) {
      addDrug(searchTerm.trim());
    }
  };

  const removeDrug = (drug) => {
    setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
    setResults(null);
  };

  const checkConflicts = async () => {
    if (selectedDrugs.length < 2) {
      toast.error("Please add at least 2 drugs to check for conflicts.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/check-drug-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: selectedDrugs }),
      });

      if (!response.ok) throw new Error('Failed to check conflicts');

      const data = await response.json();
      setResults(data);
      if (data.status === "Safe") {
         toast.success("No severe or moderate conflicts found!");
      } else {
         toast.error("Potential risks identified. Please review.");
      }
    } catch (error) {
      toast.error("Error connecting to the health model.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!results) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("MedIQ Drug Conflict Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Status: ${results.status}`, 14, 45);
    
    // Analyzed Drugs
    doc.text(`Drugs Analyzed:`, 14, 55);
    const drugString = results.analyzed_drugs.length > 0 ? results.analyzed_drugs.join(", ") : "None recognized.";
    doc.setFontSize(11);
    const splitDrugs = doc.splitTextToSize(drugString, 180);
    doc.text(splitDrugs, 14, 62);

    let startY = 62 + (splitDrugs.length * 6) + 10;

    if (results.unrecognized_drugs && results.unrecognized_drugs.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text(`Warnings: Unrecognized drugs - ${results.unrecognized_drugs.join(", ")}`, 14, startY);
      startY += 10;
    }

    // Conflicts Table
    if (results.conflicts && results.conflicts.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Conflict Details:", 14, startY);
      
      const tableData = results.conflicts.map(c => [
        c.drugs, c.risk, c.description
      ]);

      doc.autoTable({
        startY: startY + 5,
        head: [['Interacting Drugs', 'Risk Level', 'Description']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto' }
        },
        willDrawCell: function(data) {
          if (data.section === 'body' && data.column.index === 1) {
             if (data.cell.raw === 'Severe') {
                 doc.setTextColor(220, 38, 38); // Red
             } else if (data.cell.raw === 'Moderate') {
                 doc.setTextColor(234, 179, 8); // Yellow
             } else {
                 doc.setTextColor(100);
             }
          }
        }
      });
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text("Disclaimer: This tool is for informational purposes only. Consult a physician before changing medications.", 14, pageHeight - 10);

    doc.save("Drug_Conflict_Report.pdf");
    toast.success("Report downloaded successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans relative overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Drug Conflict Checker</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Pill className="text-blue-600 mr-3 h-8 w-8" />
            Drug Interaction Checker
          </h1>
          <p className="text-slate-600 mt-2">Add medications to check for potential severe or moderate interactions.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="relative mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search medication name (e.g. Paracetamol, Ibuprofen)..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                />
              </div>
              <button 
                onClick={handleCustomAdd}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" /> Add
              </button>
            </div>
            
            {/* Search Dropdown */}
            {filteredDrugs.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredDrugs.map(drug => (
                  <div 
                    key={drug}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-100 last:border-0 capitalize"
                    onClick={() => addDrug(drug)}
                  >
                    {drug}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Drugs */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Selected Medications to Check</h3>
            {selectedDrugs.length === 0 ? (
              <div className="text-slate-400 italic text-sm p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                No medications added yet. Add at least two to check for conflicts.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map(drug => (
                  <div key={drug} className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium border border-blue-100 shadow-sm">
                    <Pill className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="capitalize">{drug}</span>
                    <button 
                      onClick={() => removeDrug(drug)}
                      className="ml-3 text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-6">
            <button
              onClick={checkConflicts}
              disabled={loading || selectedDrugs.length < 2}
              className={`px-8 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center ${
                loading || selectedDrugs.length < 2 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Checking...</span>
              ) : (
                "Check Interactions"
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Interaction Report</h2>
              <button 
                onClick={downloadReport}
                className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>

            <div className={`rounded-2xl border p-6 ${results.status === 'Safe' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start">
                {results.status === 'Safe' ? (
                  <CheckCircle className="h-8 w-8 text-green-500 mr-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-orange-500 mr-4 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${results.status === 'Safe' ? 'text-green-800' : 'text-orange-800'}`}>
                    {results.status === 'Safe' ? 'No Known Interactions Found' : 'Potential Interactions Identified'}
                  </h3>
                  
                  {results.unrecognized_drugs && results.unrecognized_drugs.length > 0 && (
                    <p className="text-sm mt-3 text-slate-600 bg-white bg-opacity-60 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-amber-600">Note:</span> We couldn't recognize these custom entered drugs in our primary database: 
                      <span className="italic ml-1">{results.unrecognized_drugs.join(', ')}</span>.
                    </p>
                  )}

                  {results.conflicts && results.conflicts.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {results.conflicts.map((conflict, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-800 capitalize">{conflict.drugs.split(' & ').join(' + ')}</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              conflict.risk === 'Severe' ? 'bg-red-100 text-red-700' : 
                              conflict.risk === 'Moderate' ? 'bg-orange-100 text-orange-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {conflict.risk} Risk
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{conflict.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.status === 'Safe' && (
                    <p className="text-green-700 mt-2 text-sm">
                      Based on our database of the most common medications, there are no known severe or moderate conflicts between {results.analyzed_drugs.join(', ')}.
                    </p>
                  )}
                  
                  <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200/50">
                    Disclaimer: This prediction is generated by an AI model and based on a limited database. It is not a substitute for professional medical advice. Always consult a healthcare provider before changing medications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DrugConflict;
