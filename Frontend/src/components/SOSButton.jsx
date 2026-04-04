import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiAlertTriangle, FiNavigation, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, sending, success
  const [activeAction, setActiveAction] = useState(null); // 'hospitals', 'ambulance'

  const handleAction = async (action) => {
    setActiveAction(action);
    setStatus('sending');
    
    // Simulate emergency signal transmission
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setStatus('success');
    
    if (action === 'hospitals') {
      toast.success("Emergency signal sent to 5 nearby facilities.", {
        icon: '🏥',
        duration: 5000
      });
    } else {
      toast.success("Ambulance dispatched. ETA: 8 minutes.", {
        icon: '🚑',
        duration: 5000
      });
    }

    // Reset after success
    setTimeout(() => {
      setStatus('idle');
      setActiveAction(null);
      setIsOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* --- FLOATING SOS BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer group overflow-hidden"
        >
          {/* Pulse Animation */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-red-400 rounded-full"
          />
          <FiAlertTriangle className="text-3xl relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </motion.button>
      </div>

      {/* --- EMERGENCY MODAL --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => status === 'idle' && setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-red-100"
            >
              {/* Header */}
              <div className="bg-red-600 p-8 text-white relative">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={status !== 'idle'}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
                >
                  <FiX size={24} />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FiAlertTriangle size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Emergency Center</h2>
                    <p className="text-red-100 text-sm font-medium">Immediate assistance is available</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-4">
                {status === 'idle' ? (
                  <>
                    <button
                      onClick={() => handleAction('hospitals')}
                      className="w-full flex items-center gap-4 p-5 bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-200 rounded-2xl transition-all group"
                    >
                      <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <FiNavigation size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-900">Alert Nearby Hospitals</h4>
                        <p className="text-sm text-slate-500">Sends your data to 5 nearest facilities</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAction('ambulance')}
                      className="w-full flex items-center gap-4 p-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FiPhone size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold">Request Ambulance</h4>
                        <p className="text-sm text-red-100">Dispatches emergency medical vehicle</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center text-center">
                    {status === 'sending' ? (
                      <>
                        <div className="relative mb-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-20 h-20 border-4 border-red-100 border-t-red-600 rounded-full"
                            />
                            <FiLoader className="absolute inset-0 m-auto text-red-600 animate-pulse" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {activeAction === 'hospitals' ? 'Broadcasting Alert...' : 'Dispatching Ambulance...'}
                        </h3>
                        <p className="text-slate-500 max-w-[200px]">Connecting to emergency medical network</p>
                      </>
                    ) : (
                      <>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
                        >
                            <FiCheckCircle size={40} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Signal Confirmed</h3>
                        <p className="text-slate-500">Emergency services have received your request.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  Global Emergency Response Network Active
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
