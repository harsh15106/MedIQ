import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUser, FiCpu, FiPaperclip, FiX, FiImage, FiFileText, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiMaximize, FiDownload } from 'react-icons/fi';
import { supabase } from '../utils/SupabaseClient';
import PolishedBodyMap from '../components/PolishedBodyMap';
import FloatingDNA from '../components/FloatingDNA';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatbotReport } from '../utils/generateReport';
import LanguageSelector from '../components/LanguageSelector';

// --- COMPATIBLE TYPING EFFECT COMPONENT ---
const TypeWriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');

    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 1);
        }
        clearInterval(timer);
        return prev;
      });
    }, 15); // Slightly faster typing speed

    return () => clearInterval(timer);
  }, [text]);

  return <>{displayedText}</>;
};

export default function SymptomCheck() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // 1. STATE FOR MESSAGES & INPUT
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am the MedIQ AI. I have reviewed your medical history. What symptoms are you experiencing today?"
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

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  // NEW: AI Processing Screen State
  const [showProcessing, setShowProcessing] = useState(true);
  const [processingText, setProcessingText] = useState("Analyzing 1,284 health signals...");


  // CHATBOT STATE
  const [confirmedSymptoms, setConfirmedSymptoms] = useState([]);
  const [deniedSymptoms, setDeniedSymptoms] = useState([]);
  const [currentQuestionSymptomId, setCurrentQuestionSymptomId] = useState(null);
  const [lastReportData, setLastReportData] = useState(null);

  // NEW: Patient Profile State
  const [patientProfile, setPatientProfile] = useState({
    age: 30,
    gender: "Male",
    height_cm: null,
    weight_kg: null,
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
            height_cm: profile.height ? Number(profile.height) : null,
            weight_kg: profile.weight ? Number(profile.weight) : null,
            user_id: user.id
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
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);


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

    // Prevent sending if input is empty
    if (!input.trim()) return;

    // Add user message to chat
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      language: selectedLanguage
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
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
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_profile: patientProfile,
          new_text: currentInput,
          confirmed_symptoms: currentConfirmed,
          denied_symptoms: currentDenied,
          language: selectedLanguage
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

        // Store report data for PDF export
        setLastReportData({
          disease: data.top_disease,
          report: aiResponseText,
          confirmedSymptoms: data.confirmed_symptoms || [],
          predictions: data.predictions || []
        });

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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-800 overflow-hidden">
        {/* Subtle radial glow background to maintain theme DNA */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white"></div>

        {/* --- HIGH-TECH SCANNING RAYS --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-[scan-vertical_4s_linear_infinite]"></div>
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-teal-400/20 to-transparent animate-[scan-horizontal_6s_linear_infinite]"></div>
        </div>

        {/* --- DYNAMIC NEURAL CORE --- */}
        <div className="relative flex items-center justify-center mb-16">

          {/* Circular ECG Heartbeat Waveform */}
          <div className="absolute w-80 h-80 opacity-40">
            <svg className="w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
              <path
                d="M 10,50 L 30,50 L 35,30 L 40,70 L 45,50 L 90,50"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1"
                strokeDasharray="200"
                className="animate-[dash_3s_ease-in-out_infinite]"
              />
            </svg>
          </div>

          {/* Synaptic Ring Layers */}
          <div className="absolute w-64 h-64 rounded-full border border-blue-100 shadow-[inset_0_0_30px_rgba(37,99,235,0.03)]"></div>
          <div className="absolute w-52 h-52 rounded-full border-2 border-blue-400/20 border-t-blue-500 animate-spin"></div>
          <div className="absolute w-44 h-44 rounded-full border border-teal-300/30 animate-[spin_4s_linear_infinite_reverse]"></div>

          {/* Central Biometric Hub */}
          <div className="relative w-28 h-28 bg-white border border-slate-100 rounded-3xl shadow-[0_10px_40px_rgba(37,99,235,0.15)] flex items-center justify-center overflow-hidden z-10 animate-[pulse_2s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-teal-500/5"></div>
            <FiCpu className="text-4xl text-blue-600 drop-shadow-sm" />

            {/* Inner "Thinking" Pulse */}
            <div className="absolute bottom-4 flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>

        {/* --- STATUS TEXT AREA --- */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600">MedIQ Neural Engine</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-8 min-h-[3rem]">
            {processingText}
          </h2>

          <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-400 to-blue-600 w-full animate-[loading-bar_2s_infinite]"></div>
          </div>

          <p className="mt-4 text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">
            Synthesizing Clinical Logic
          </p>
        </div>

        {/* Custom CSS for the specialized animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes dash {
            0% { stroke-dashoffset: 200; opacity: 0; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes scan-vertical {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes scan-horizontal {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100vw); }
          }
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}} />
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
        <div className="w-full max-w-none px-4 md:px-12 mx-auto space-y-8 pb-4">
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

                  {/* RENDER TEXT MESSAGE */}
                  {msg.text && (
                    <div className={`px-6 py-4 rounded-[24px] shadow-sm text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap font-medium ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-blue-500/20'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                      }`}>
                      {msg.sender === 'ai' ? (
                        <TypeWriterText text={msg.text} delay={0.2} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  )}

                  {/* PDF Download Button — appears after a report-type AI message */}
                  {msg.sender === 'ai' && lastReportData && msg.text && msg.text.includes('CLINICAL REPORT') && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => generateChatbotReport(lastReportData)}
                      className="flex items-center gap-2 px-4 py-2 mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <FiDownload className="text-base" />
                      Download AI Report
                    </motion.button>
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
              <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-blue-600 shadow-md flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                {/* Premium rotating border effect */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#3b82f6_360deg)] animate-[spin_3s_linear_infinite] opacity-50"></div>
                <div className="absolute inset-0 m-[1px] bg-white rounded-full flex items-center justify-center z-10">
                  <FiCpu className="text-xl animate-pulse" />
                </div>
              </div>
              <div className="bg-white border border-slate-100 pl-4 pr-6 py-4 rounded-[24px] rounded-tl-sm shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex items-center gap-4 relative overflow-hidden">
                {/* Subtle gradient wash over thinking container */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent"></div>

                {/* Modern Equalizer/Scanner Animation */}
                <div className="flex gap-1 items-end h-4 relative z-10 opacity-80">
                  <motion.div
                    animate={{ height: ["4px", "14px", "4px"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0 }}
                    className="w-1 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ height: ["6px", "16px", "6px"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.15 }}
                    className="w-1 bg-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ height: ["4px", "10px", "4px"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.3 }}
                    className="w-1 bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={{ height: ["8px", "16px", "8px"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.45 }}
                    className="w-1 bg-blue-400 rounded-full"
                  />
                </div>

                <span className="text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 tracking-widest uppercase relative z-10 flex items-center gap-1.5">
                  Analyzing
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >...</motion.span>
                </span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <div className="bg-white/90 backdrop-blur-2xl border-t border-slate-100 p-4 sm:p-6 shrink-0 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.03)] z-20">
        
        <div className="w-full max-w-none px-4 md:px-12 mx-auto">
          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="relative flex items-center gap-3">

            {/* Language Selector */}
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />

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
                  disabled={!input.trim() || isThinking}
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