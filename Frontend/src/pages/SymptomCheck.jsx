import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUser, FiCpu, FiPaperclip, FiX, FiImage, FiFileText } from 'react-icons/fi';
import { supabase } from '../utils/SupabaseClient';

// --- NEW: TYPEWRITER COMPONENT ---
const TypewriterText = ({ text, onType }) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    index.current = 0;

    const timer = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current++;
        if (onType && index.current % 3 === 0) onType();
      } else {
        clearInterval(timer);
        if (onType) onType();
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text, onType]);

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
      text: "Hello! I am the MedIQ AI. I have reviewed your medical history. What symptoms are you experiencing today? You can also upload photos or lab reports."
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

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

  // 3. HANDLE FILE SELECTION
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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
      const response = await fetch('http://127.0.0.1:8000/chat', {
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
    <div className="flex flex-col h-screen bg-theme-bg transition-colors duration-300">

      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-theme-bg-light/30 px-6 py-4 flex items-center gap-4 z-10 shrink-0 transition-colors duration-300">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-theme-text-muted hover:text-theme-accent bg-theme-surface hover:bg-theme-bg-light/20 rounded-full transition cursor-pointer"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800 leading-tight">AI Intelligence Engine</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-theme-accent rounded-full animate-pulse shadow-[0_0_5px_1px_rgba(47,164,164,0.5)]"></span>
            <p className="text-xs text-theme-accent font-semibold tracking-wide uppercase opacity-90">Model Active</p>
          </div>
        </div>
      </nav>

      {/* --- CHAT HISTORY AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user'
                ? 'bg-theme-accent text-white'
                : 'bg-white border border-theme-bg-light/20 text-theme-accent shadow-sm'
                }`}>
                {msg.sender === 'user' ? <FiUser className="text-lg" /> : <FiCpu className="text-lg" />}
              </div>

              {/* Message Bubble container */}
              <div className={`flex flex-col gap-2 max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                {/* RENDER ATTACHMENT IF IT EXISTS */}
                {msg.attachment && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl shadow-sm border ${msg.sender === 'user'
                    ? 'bg-theme-accent border-theme-accent text-white opacity-90'
                    : 'bg-white border-theme-bg-light/20 text-slate-800'
                    }`}>
                    {msg.attachment.type.includes('image') ? <FiImage className="text-2xl opacity-80" /> : <FiFileText className="text-2xl opacity-80" />}
                    <div className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">
                      {msg.attachment.name}
                    </div>
                  </div>
                )}

                {/* RENDER TEXT MESSAGE */}
                {msg.text && (
                  <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-tr-none shadow-ai-glow'
                    : 'bg-white border border-white text-slate-800 rounded-tl-none'
                    }`}>
                    {msg.sender === 'ai' ? (
                      <TypewriterText text={msg.text} onType={scrollToBottom} />
                    ) : (
                      msg.text
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}

          {/* --- AI THINKING INDICATOR --- */}
          {isThinking && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-theme-bg-light/20 text-theme-accent shadow-sm flex items-center justify-center flex-shrink-0">
                <FiCpu className="text-lg" />
              </div>
              <div className="bg-white border border-theme-bg-light/20 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-theme-bg rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-theme-bg rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-theme-bg rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-theme-bg-light/30 p-4 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">

        {/* PREVIEW SELECTED FILE BEFORE SENDING */}
        {selectedFile && (
          <div className="max-w-3xl mx-auto mb-3 px-4 py-2 bg-theme-surface rounded-lg flex items-center justify-between border border-theme-bg-light/20">
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedFile.type.includes('image') ? <FiImage className="text-theme-accent flex-shrink-0" /> : <FiFileText className="text-theme-accent flex-shrink-0" />}
              <span className="text-sm font-light text-slate-700 truncate">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-theme-text/60 hover:text-red-400 transition"
              title="Remove attachment"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}

        {/* INPUT FORM */}
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-2">

          {/* Attachment Button */}
          <label className="cursor-pointer p-3.5 bg-theme-surface hover:bg-theme-bg-light/20 text-theme-text/60 hover:text-theme-accent rounded-full border border-theme-bg-light/20 transition-colors flex-shrink-0">
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

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms or attach an image..."
              className="w-full pl-5 pr-14 py-4 bg-white border border-white focus:border-theme-accent/30 text-slate-800 rounded-full focus:ring-4 focus:ring-theme-accent/10 outline-none font-normal shadow-sm transition-all"
              disabled={isThinking}
            />
            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isThinking}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full hover:shadow-ai-glow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              <FiSend className="text-lg" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-theme-text-light font-medium mt-4 tracking-wide">
          AI generated intelligence. Always consult a certified physician for medical treatment.
        </p>
      </div>

    </div>
  );
}