import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUser, FiCpu, FiPaperclip, FiX, FiImage, FiFileText } from 'react-icons/fi';

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
  
  // NEW: State to hold the currently selected file/image
  const [selectedFile, setSelectedFile] = useState(null);

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

  // 4. HANDLE SENDING A MESSAGE
  const handleSend = (e) => {
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
    setInput('');
    setSelectedFile(null); // Clear the attachment after sending
    setIsThinking(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: userMsg.attachment 
          ? "I have analyzed the file you uploaded along with your symptoms. It appears to be consistent with your current condition, but I recommend having a specialist review these results."
          : "I understand you're feeling that way. Based on your symptoms and history, it could be a mild viral infection, but we should monitor it. Do you have a fever or any shortness of breath?" 
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4 z-10 shrink-0">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">AI Symptom Check</h1>
          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">MedIQ Assistant is online</p>
        </div>
      </nav>

      {/* --- CHAT HISTORY AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
              }`}>
                {msg.sender === 'user' ? <FiUser className="text-lg" /> : <FiCpu className="text-lg" />}
              </div>

              {/* Message Bubble container */}
              <div className={`flex flex-col gap-2 max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* RENDER ATTACHMENT IF IT EXISTS */}
                {msg.attachment && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl shadow-sm border ${
                    msg.sender === 'user' 
                      ? 'bg-teal-700 border-teal-600 text-teal-50' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    {msg.attachment.type.includes('image') ? <FiImage className="text-2xl opacity-80" /> : <FiFileText className="text-2xl opacity-80" />}
                    <div className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">
                      {msg.attachment.name}
                    </div>
                  </div>
                )}

                {/* RENDER TEXT MESSAGE (Only if text is not empty) */}
                {msg.text && (
                  <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                )}
              </div>

            </div>
          ))}

          {/* --- AI THINKING INDICATOR --- */}
          {isThinking && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 shadow-sm flex items-center justify-center flex-shrink-0">
                <FiCpu className="text-lg" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        
        {/* PREVIEW SELECTED FILE BEFORE SENDING */}
        {selectedFile && (
          <div className="max-w-3xl mx-auto mb-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedFile.type.includes('image') ? <FiImage className="text-teal-600 dark:text-teal-400 flex-shrink-0" /> : <FiFileText className="text-teal-600 dark:text-teal-400 flex-shrink-0" />}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{selectedFile.name}</span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)} 
              className="text-slate-400 hover:text-red-500 transition"
              title="Remove attachment"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}

        {/* INPUT FORM */}
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-2">
          
          {/* Attachment Button */}
          <label className="cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0">
            <FiPaperclip className="text-xl" />
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
              className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-full focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-colors"
              disabled={isThinking}
            />
            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isThinking}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="text-lg" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-3">
          AI generated advice. Always consult a doctor for serious conditions.
        </p>
      </div>

    </div>
  );
}