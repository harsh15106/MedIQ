import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUser, FiCpu, FiPaperclip, FiX, FiImage, FiFileText, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiMaximize } from 'react-icons/fi';
import { supabase } from '../utils/SupabaseClient';
import PolishedBodyMap from '../components/PolishedBodyMap';
import FloatingDNA from '../components/FloatingDNA';
import { motion, AnimatePresence } from 'framer-motion';

export default function SymptomCheck() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // 1. STATE FOR MESSAGES & INPUT
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am the MedIQ AI. I have reviewed your medical history. What symptoms are you experiencing today? You can also upload photos or lab reports."
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // NEW: Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // NEW: 3D Body Map State
  const [showBodyMap, setShowBodyMap] = useState(false);

  // NEW: AI Processing Screen State
  const [showProcessing, setShowProcessing] = useState(true);
  const [processingText, setProcessingText] = useState("Analyzing 1,284 health signals...");

  // NEW: State to hold the currently selected file/image
  const [selectedFile, setSelectedFile] = useState(null);

  // CHATBOT STATE
  const [confirmedSymptoms, setConfirmedSymptoms] = useState([]);
  const [deniedSymptoms, setDeniedSymptoms] = useState([]);
  const [currentQuestionSymptomId, setCurrentQuestionSymptomId] = useState(null);

  // NEW: Patient Profile State
  const [patientProfile, setPatientProfile] = useState({
    age: 30,
    gender: "Male",
    height_cm: 170.0,
    weight_kg: 70.0,
    smoker: false,
    family_history: false
  });

  // Fetch true user profile on mount
  useEffect(() => {
    // Initialization for Web Speech API (Speech Recognition)
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update input field dynamically
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        } else {
          // If you want to show interim results, you could have a separate state for it.
          // For simplicity, we only append final transcript.
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('dob, gender, weight, height')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          let age = 30; // Default fallback
          if (profile.dob) {
            const birthDate = new Date(profile.dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          setPatientProfile(prev => ({
            ...prev,
            age: age,
            gender: profile.gender || "Male",
            height_cm: profile.height ? Number(profile.height) : 170.0,
            weight_kg: profile.weight ? Number(profile.weight) : 70.0,
          }));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();

    // AI Processing Screen Text Rotation
    const timer1 = setTimeout(() => {
      setProcessingText("Detecting risk patterns...");
    }, 1500);
    const timer2 = setTimeout(() => {
      setProcessingText("Generating predictive insights...");
    }, 3000);
    const timer3 = setTimeout(() => {
      setShowProcessing(false);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // 2. AUTO-SCROLL TO BOTTOM OF CHAT
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // 3. HANDLE FILE SELECTION
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 3.2 HANDLE 3D BODY MAP SELECTION
  const handleBodyPartSelect = (partName) => {
    setInput(prev => prev + (prev ? ' ' : '') + `I feel pain in my ${partName}.`);
    setShowBodyMap(false); // Auto-close map after selection
  };

  // 3.5 TEXT TO SPEECH FUNCTION
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize voice, pitch, rate here
    utterance.rate = 1.05;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice output
  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Toggle speech recording
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInput(''); // Optional: clear input before starting new recording
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
  }, []);

  // 4. HANDLE SENDING A MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();

    // Prevent sending if both input and file are empty
    if (!input.trim() && !selectedFile) return;

    // Add user message to chat, including the attachment if it exists
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      attachment: selectedFile ? { name: selectedFile.name, type: selectedFile.type } : null
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setSelectedFile(null); // Clear the attachment after sending
    setIsThinking(true);

    let currentConfirmed = [...confirmedSymptoms];
    let currentDenied = [...deniedSymptoms];

    // Check if we are answering a follow-up question
    if (currentQuestionSymptomId) {
      const lowerInput = currentInput.trim().toLowerCase();
      // Simple YES/NO heuristic
      if (lowerInput === 'no' || lowerInput === 'n' || lowerInput === 'nope' || lowerInput.includes('not have') || lowerInput.includes("don't have")) {
        currentDenied.push(currentQuestionSymptomId);
      } else if (lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 'yeah' || lowerInput === 'yep' || lowerInput.includes('do have')) {
        currentConfirmed.push(currentQuestionSymptomId);
      } else {
        // If ambiguous, assume affirmative unless text contains "no "
        if (lowerInput.includes('no ')) {
          currentDenied.push(currentQuestionSymptomId);
        } else {
          currentConfirmed.push(currentQuestionSymptomId);
        }
      }
      setCurrentQuestionSymptomId(null);
    }

    try {
      // Call the Python FastAPI
      const response = await fetch('http://127.0.0.1:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_profile: patientProfile,
          new_text: currentInput,
          confirmed_symptoms: currentConfirmed,
          denied_symptoms: currentDenied
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Update our stored state with whatever the backend extracted
      if (data.confirmed_symptoms) setConfirmedSymptoms(data.confirmed_symptoms);
      if (data.denied_symptoms) setDeniedSymptoms(data.denied_symptoms);

      let aiResponseText = "";

      if (data.type === "question") {
        setCurrentQuestionSymptomId(data.symptom_id);
        aiResponseText = data.question_text;
      } else if (data.type === "report") {
        aiResponseText = data.report || `Based on my analysis, you might have ${data.top_disease}.`;

        // Reset the diagnosis state so the next message starts fresh!
        setConfirmedSymptoms([]);
        setDeniedSymptoms([]);
        setCurrentQuestionSymptomId(null);
      }

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText
      };

      setMessages((prev) => [...prev, aiResponse]);
      speakText(aiResponseText);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting to my analysis engine right now. Please try again later."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  if (showProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-theme-accent-dark to-theme-accent-deep text-white overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent blur-3xl opacity-50"></div>

        {/* Animated Orbs/Rings */}
        <div className="relative flex items-center justify-center mb-12">
          <div className="absolute w-64 h-64 border-[1px] border-theme-accent/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-48 h-48 border-[2px] border-teal-500/40 rounded-full border-t-transparent animate-[spin_3s_linear_infinite_reverse]"></div>
          <div className="absolute w-32 h-32 border-[2px] border-white/20 rounded-full border-b-transparent animate-[spin_4s_ease-in-out_infinite]"></div>

          {/* Center Core */}
          <div className="w-16 h-16 bg-theme-accent rounded-full animate-pulse shadow-[0_0_30px_10px_rgba(47,164,164,0.3)] flex items-center justify-center">
            <FiCpu className="text-3xl text-white opacity-90 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Text */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-theme-surface-alt font-medium tracking-widest text-sm uppercase mb-4 opacity-80 animate-pulse">
            System Active
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight h-10 transition-opacity duration-500 text-white/90">
            {processingText}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 transition-colors duration-300 relative overflow-hidden">
      
      {/* --- 3D BACKGROUND --- */}
      <FloatingDNA />

      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">AI Intelligence Engine</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-600 animate-pulse'}`}></span>
              <p className="text-xs text-blue-600 font-bold tracking-wide uppercase opacity-90">
                  {isSpeaking ? 'AI Speaking...' : 'System Active'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Voice Toggle */}
        <button
          onClick={toggleVoice}
          className={`p-2.5 rounded-full transition-all shadow-sm active:scale-95 ${voiceEnabled ? 'text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100' : 'text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}
          title={voiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
        >
          {voiceEnabled ? <FiVolume2 className="text-xl" /> : <FiVolumeX className="text-xl" />}
        </button>
      </nav>

      {/* --- 3D BODY MAP MODAL --- */}
      {showBodyMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/40">
           <div className="w-full max-w-4xl relative animate-in fade-in zoom-in duration-300">
               <PolishedBodyMap 
                  onSelectPart={handleBodyPartSelect} 
                  onClose={() => setShowBodyMap(false)} 
               />
           </div>
        </div>
      )}

      {/* --- CHAT HISTORY AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-transparent scroll-smooth z-10 relative">
        <div className="max-w-4xl mx-auto space-y-8 pb-4">
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >

                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border ${msg.sender === 'user'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white border-slate-200 text-blue-600'
                  }`}>
                  {msg.sender === 'user' ? <FiUser className="text-xl" /> : <FiCpu className="text-xl" />}
                </div>

                {/* Message Bubble container */}
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                  {/* RENDER ATTACHMENT IF IT EXISTS */}
                  {msg.attachment && (
                    <div className={`flex items-center gap-3 p-3.5 rounded-2xl shadow-sm border ${msg.sender === 'user'
                      ? 'bg-blue-600 border-blue-500 text-white opacity-95'
                      : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                      {msg.attachment.type.includes('image') ? <FiImage className="text-2xl opacity-80" /> : <FiFileText className="text-2xl opacity-80" />}
                      <div className="text-sm font-semibold truncate max-w-[150px] sm:max-w-xs">
                        {msg.attachment.name}
                      </div>
                    </div>
                  )}

                  {/* RENDER TEXT MESSAGE */}
                  {msg.text && (
                    <div className={`px-6 py-4 rounded-[24px] shadow-sm text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap font-medium ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-blue-500/20'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                      }`}>
                      {msg.text}
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

          {/* --- AI THINKING INDICATOR --- */}
          {isThinking && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-blue-600 shadow-md flex items-center justify-center flex-shrink-0 animate-pulse">
                <FiCpu className="text-xl" />
              </div>
              <div className="bg-white border border-slate-100 px-6 py-5 rounded-[24px] rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-2">
                 <div className="flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 animate-[ping_1.5s_infinite_0ms]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80 animate-[ping_1.5s_infinite_200ms]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400/80 animate-[ping_1.5s_infinite_400ms]"></span>
                 </div>
                 <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analyzing</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <div className="bg-white/90 backdrop-blur-2xl border-t border-slate-100 p-4 sm:p-6 shrink-0 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.03)] z-20">
        
        <div className="max-w-4xl mx-auto">
          {/* PREVIEW SELECTED FILE BEFORE SENDING */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {selectedFile.type.includes('image') ? <FiImage className="text-xl text-blue-600" /> : <FiFileText className="text-xl text-blue-600" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Remove attachment"
                >
                  <FiX className="text-lg" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="relative flex items-center gap-3">

            {/* Attachment Button */}
            <label className="cursor-pointer p-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-2xl border border-slate-200 transition-all flex-shrink-0 shadow-sm active:scale-95">
              <FiPaperclip className="text-[22px]" />
              {/* Hidden file input */}
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isThinking}
              />
            </label>

            {/* 3D Body Map Scanner Button */}
            <button
              type="button"
              onClick={() => setShowBodyMap(true)}
              disabled={isThinking}
              className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl border border-blue-100 transition-all flex-shrink-0 shadow-sm active:scale-95 group relative overflow-hidden"
              title="Open 3D Body Scanner"
            >
              {/* Subtle animated background swipe on hover */}
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <FiMaximize className="text-[22px] relative z-10" />
            </button>

            {/* Text Input Container */}
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening to your symptoms..." : "Describe symptoms or attach an image..."}
                className={`w-full pl-6 pr-28 py-4.5 bg-white text-slate-800 rounded-2xl border-2 outline-none font-medium text-[16px] shadow-sm transition-all focus:shadow-md ${isRecording ? 'border-red-300 focus:border-red-400 bg-red-50/30 placeholder-red-400' : 'border-slate-200 focus:border-blue-400 hover:border-slate-300 placeholder-slate-400'}`}
                disabled={isThinking}
              />
              
              {/* Mic and Send Button Container */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isThinking}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                      isRecording 
                          ? 'bg-red-500 text-white animate-pulse shadow-lg scale-105' 
                          : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                  title={isRecording ? "Stop Recording" : "Start Voice Input"}
                >
                    {isRecording ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
                </button>
                
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedFile) || isThinking}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-blue-500/30"
                >
                  <FiSend className="text-xl translate-x-px translate-y-px" />
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-[11px] text-slate-400 font-semibold mt-4 tracking-wider uppercase">
             MedIQ AI generates predictions based on health data. Always consult a physician.
          </p>
        </div>
      </div>

    </div>
  );
}