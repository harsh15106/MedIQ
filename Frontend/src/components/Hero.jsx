import React from 'react';

export default function Hero() {
  return (
    <header className="relative pt-32 pb-20 overflow-hidden transition-colors duration-300 bg-gradient-to-b from-blue-50 via-blue-50/30 to-white   ">

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
            50% { transform: translateY(-25px) scale(1.1); opacity: 0.8; }
          }
          .animate-particle { animation: float 6s ease-in-out infinite; }
          .delay-2000 { animation-delay: 2s; }
          .delay-4000 { animation-delay: 4s; }
        `}
      </style>

      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 ">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-200  rounded-full mix-blend-multiply filter blur-3xl animate-particle"></div>
        <div className="absolute top-20 right-20 w-48 h-48 bg-blue-300  rounded-full mix-blend-multiply filter blur-3xl animate-particle delay-2000"></div>
        <div className="absolute -bottom-10 left-1/3 w-56 h-56 bg-blue-100  rounded-full mix-blend-multiply filter blur-3xl animate-particle delay-4000"></div>

        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400  rounded-full animate-particle delay-2000 shadow-sm"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-blue-500  rounded-full animate-particle opacity-60"></div>
        <div className="absolute bottom-1/4 left-2/3 w-2 h-2 bg-blue-300  rounded-full animate-particle delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <div className="inline-block bg-white/80  text-blue-700  px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm border border-blue-100  backdrop-blur-sm">
          Next-Generation Health Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900  tracking-tight mb-6 leading-tight transition-colors duration-300">
          Smarter Healthcare <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400  ">
            at Your Fingertips
          </span>
        </h1>

        <p className="mt-6 text-xl text-slate-600  max-w-2xl mx-auto mb-10 transition-colors duration-300">
          MedIQ provides intelligent symptom tracking, seamless telemedicine connections, and secure management of your personal health records.
        </p>

      </div>
    </header>
  );
}