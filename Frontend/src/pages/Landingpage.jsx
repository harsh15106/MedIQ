import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiCpu, FiShield, FiTrendingUp, FiLayers, FiDatabase, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';

// Use the local skeleton image
import HumanBodyImg from '../assets/HUMAN_BODY.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState('initializing'); // 'initializing', 'scanning', 'complete'
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let timeoutId;
    let animationFrameId;

    const runScanCycle = () => {
      // Phase 1: Init (0-0.8s)
      setScanState('initializing');
      setScanProgress(0);

      timeoutId = setTimeout(() => {
        // Phases 2 & 3: Scan Movement (0.8s to 4.5s)
        setScanState('scanning');

        let start = null;
        const duration = 3700; // 3.7 seconds for the downward sweep

        const animateScanner = (timestamp) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min((progress / duration) * 100, 100);

          setScanProgress(percentage);

          if (progress < duration) {
            animationFrameId = requestAnimationFrame(animateScanner);
          } else {
            // Phase 5: Result (4.5s -> wait 3s, then loop)
            setScanState('complete');

            timeoutId = setTimeout(() => {
              runScanCycle();
            }, 3000);
          }
        };

        animationFrameId = requestAnimationFrame(animateScanner);
      }, 800);
    };

    // Start cycle automatically on mount
    runScanCycle();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const features = [
    { title: "Real-Time Monitoring", desc: "Instantly process and analyze complex medical symptoms with our core neural intelligence model.", icon: <FiActivity strokeWidth={1.5} /> },
    { title: "Predictive Modeling", desc: "Detect probabilistic health risks before they escalate using extensive longitudinal datasets.", icon: <FiTrendingUp strokeWidth={1.5} /> },
    { title: "Secure Data Vault", desc: "Your medical history remains completely encrypted and accessible only by you.", icon: <FiDatabase strokeWidth={1.5} /> },
    { title: "Continuous AI Learning", desc: "Our diagnostic models grow smarter and adapt dynamically as more clinical data is processed.", icon: <FiCpu strokeWidth={1.5} /> }
  ];

  return (
    <div className="min-h-screen font-sans bg-theme-bg text-theme-text overflow-x-hidden transition-colors duration-300 selection:bg-theme-accent selection:text-white">
      <Navbar />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative px-4 pt-32 pb-32 lg:pt-40 lg:pb-32 bg-[radial-gradient(circle_at_center,_#0B1F1F_0%,_#000000_100%)] overflow-hidden flex items-center min-h-[100vh]">
          {/* Background Ambient Layers */}
          <div className="absolute inset-0 z-0">
            {/* Tiny Teal Particles (simulated with grain and gradient) */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left Column: Typography & CTAs */}
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(47,164,164,0.4)] bg-[rgba(47,164,164,0.1)] shadow-[0_0_15px_rgba(47,164,164,0.2)] mb-8">
                <div className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse"></div>
                <span className="text-xs font-semibold tracking-widest text-[#CFEAEA] uppercase">Predictive Healthcare AI</span>
              </div>

              {/* Headline */}
              <h1 className="text-[52px] md:text-[72px] lg:text-[88px] font-semibold text-[#F4F8F8] tracking-tight leading-[1.05] mb-6">
                AI That Understands <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2FA4A4] to-[#38B2AC]">Your Health.</span>
              </h1>

              {/* Subtext */}
              <p className="text-[18px] md:text-[20px] font-normal leading-relaxed text-[#9FBFBF] max-w-lg mb-10">
                Our AI continuously analyzes your health signals, behavioral patterns, and internal risk markers to detect potential issues before they escalate.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 rounded-full font-medium text-[16px] text-[#000000] bg-gradient-to-br from-[#2FA4A4] to-[#38B2AC] shadow-[0_0_20px_rgba(47,164,164,0.35)] transition-all duration-250 ease-out hover:-translate-y-[2px] hover:shadow-[0_0_35px_rgba(47,164,164,0.6)] active:scale-95 flex items-center justify-center gap-2"
                >
                  Access AI Dashboard
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-full font-medium text-[16px] text-[#F4F8F8] bg-white/5 border border-[#2FA4A4]/30 backdrop-blur-md transition-all duration-250 ease-out hover:-translate-y-[2px] hover:bg-white/10 active:scale-95 flex items-center justify-center"
                >
                  Learn How It Works
                </button>
              </div>
            </div>

            {/* Right Column: AUTOMATIC AI SCAN ANIMATION */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative w-[340px] md:w-[420px] aspect-[1/1.5] rounded-3xl bg-[#030808] border border-[rgba(47,164,164,0.15)] shadow-[0_0_50px_rgba(11,31,31,0.8)] overflow-hidden flex items-center justify-center">

                {/* Subtle inner depth glow */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(47,164,164,0.1)] z-0 rounded-3xl"></div>
                {/* Digital Grid lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(47,164,164,0.05)_1px,_transparent_1px),_linear-gradient(90deg,rgba(47,164,164,0.05)_1px,_transparent_1px)] bg-[size:20px_20px] mix-blend-screen opacity-50 z-0 pointer-events-none"></div>

                {/* Breathing Glow behind skeleton */}
                <div className={`absolute inset-0 flex items-center justify-center z-0 transition-opacity duration-1000 ${scanState === 'initializing' ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="w-[80%] h-[90%] bg-[#2FA4A4] blur-[100px] opacity-10 rounded-full animate-pulse"></div>
                </div>

                {/* Provided Skeleton Image */}
                <img
                  src={HumanBodyImg}
                  alt="AI Diagnostic Scan"
                  className="absolute inset-0 w-full h-full object-contain object-center z-10 mix-blend-screen"
                />

                {/* SCAN SEQUENCE OVERLAYS */}

                {/* Initialization Text (Bottom Right) */}
                <div className={`absolute bottom-4 right-6 transition-opacity duration-500 z-30 ${scanState === 'initializing' ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-[10px] font-mono text-[#38B2AC] tracking-widest uppercase animate-pulse">Initializing AI Model...</span>
                </div>

                {/* Horizontal Scan Bar */}
                {(scanState === 'scanning' || (scanState === 'complete' && scanProgress < 100)) && (
                  <div
                    className="absolute left-[10%] w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#38B2AC] to-transparent shadow-[0_0_20px_4px_rgba(56,178,172,0.8)] z-20 blur-[1px]"
                    style={{ top: `${Math.max(5, scanProgress)}%` }}
                  >
                    {/* Inner intensity line */}
                    <div className="absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-white -translate-y-1/2 opacity-80 blur-[0.5px]"></div>
                  </div>
                )}

                {/* Reactive Diagnostic Highlights (Red/Teal Pulses based on progress) */}

                {/* Head Region (approx 10-15% progress) */}
                <div className={`absolute top-[12%] left-1/2 -translate-x-1/2 w-[80px] h-[80px] rounded-full border border-[#FF3B3B]/0 bg-[#FF3B3B]/30 blur-[20px] z-10 transition-all duration-300 ${(scanState === 'scanning' && scanProgress > 8 && scanProgress < 18) ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}></div>

                {/* Brain Data Pulse radiating out */}
                {(scanState === 'scanning' && scanProgress > 8 && scanProgress < 40) && (
                  <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-[#38B2AC] z-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                )}

                {/* Chest / Ribcage (approx 25-35% progress) */}
                <div className={`absolute top-[28%] left-1/2 -translate-x-1/2 w-[120px] h-[100px] rounded-[50%] bg-[#FF3B3B]/20 blur-[25px] z-10 transition-all duration-300 ${(scanState === 'scanning' && scanProgress > 22 && scanProgress < 36) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}></div>

                {/* Heart Data Pulse */}
                {(scanState === 'scanning' && scanProgress > 22 && scanProgress < 60) && (
                  <div className="absolute top-[30%] left-[55%] -translate-x-1/2 w-3 h-3 rounded-full border border-[#38B2AC] z-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" style={{ animationDelay: '0.3s' }}></div>
                )}

                {/* Arms / Spine (approx 35-50% progress) */}
                <div className={`absolute top-[45%] left-1/2 -translate-x-1/2 w-[160px] h-[60px] rounded-[50%] bg-[#FF3B3B]/10 blur-[20px] z-10 transition-all duration-300 ${(scanState === 'scanning' && scanProgress > 36 && scanProgress < 50) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}></div>

                {/* Spine Data Pulse */}
                {(scanState === 'scanning' && scanProgress > 36 && scanProgress < 75) && (
                  <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-[#38B2AC] z-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" style={{ animationDelay: '0.6s' }}></div>
                )}

                {/* Knees Highlight (approx 70-80% progress) */}
                <div className={`absolute top-[75%] left-1/2 -translate-x-1/2 w-[100px] h-[40px] rounded-[50%] bg-[#38B2AC]/20 blur-[15px] z-10 transition-all duration-300 ${(scanState === 'scanning' && scanProgress > 68 && scanProgress < 80) ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}></div>

                {/* Neural connection lines overlay (Very faint) */}
                {scanState === 'scanning' && (
                  <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline points="50,15 40,25 60,35 45,50 55,70" fill="none" stroke="#2FA4A4" strokeWidth="0.2" className="animate-pulse" />
                    <polyline points="50,15 65,20 30,40 50,60" fill="none" stroke="#38B2AC" strokeWidth="0.1" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </svg>
                )}

                {/* FINAL RESULT STATE: Floating Badge Top Right */}
                <div className={`absolute top-6 right-6 bg-[#000000]/80 backdrop-blur-xl border border-[#2FA4A4]/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(47,164,164,0.3)] transition-all duration-700 ease-out transform z-30 ${scanState === 'complete' ? 'opacity-100 translate-y-0 scale-100 animate-[pulse_3s_infinite_ease-in-out]' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                  <div className="text-[10px] font-bold text-[#9FBFBF] uppercase tracking-wider mb-1">Risk Assessed</div>
                  <div className="text-2xl font-bold text-[#F4F8F8]">12% <span className="text-sm font-medium text-[#38B2AC] ml-1">— Low</span></div>
                </div>

                {/* FINAL RESULT STATE: Bottom Signals Text */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-max bg-[#000000]/90 backdrop-blur-xl border border-[#2FA4A4]/30 rounded-full px-5 py-2.5 transition-all duration-700 ease-out z-30 shadow-[0_0_15px_rgba(0,0,0,0.8)] ${scanState === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-[#38B2AC] text-sm" />
                    <span className="text-[12px] font-medium text-[#CFEAEA]">Analyzed 1,284 Health Signals</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* 2. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 bg-theme-bg border-b border-theme-bg-light/30 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Decorative Connector Line (Desktop Only) */}
              <div className="hidden md:block absolute top-[28px] left-[20%] w-[60%] h-px bg-gradient-to-r from-transparent via-theme-accent-light/40 to-transparent"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white border border-theme-accent/20 flex items-center justify-center shadow-sm mb-6 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(47,164,164,0.15)] hover:border-theme-accent/40">
                  <span className="text-theme-accent text-lg font-semibold tracking-wide">01</span>
                </div>
                <h3 className="text-[20px] font-semibold text-slate-800 mb-3">Input Data</h3>
                <p className="text-theme-text-muted font-normal leading-[1.6] px-4">Provide context around your current health signals or upload reports.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white border border-theme-accent/20 flex items-center justify-center shadow-sm mb-6 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(47,164,164,0.15)] hover:border-theme-accent/40">
                  <span className="text-theme-accent text-lg font-semibold tracking-wide">02</span>
                </div>
                <h3 className="text-[20px] font-semibold text-slate-800 mb-3">AI Analysis</h3>
                <p className="text-theme-text-muted font-normal leading-[1.6] px-4">Our predictive neural models process your data against vast datasets.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white border border-theme-accent/20 flex items-center justify-center shadow-sm mb-6 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(47,164,164,0.15)] hover:border-theme-accent/40">
                  <span className="text-theme-accent text-lg font-semibold tracking-wide">03</span>
                </div>
                <h3 className="text-[20px] font-semibold text-slate-800 mb-3">Risk Detection</h3>
                <p className="text-theme-text-muted font-normal leading-[1.6] px-4">Access an instant, intelligent breakdown of calculated risk models.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="py-24 bg-theme-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((item, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-ai-glow-hover hover:border-theme-accent/20 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-theme-accent text-2xl mb-6 shadow-sm border border-theme-accent/10 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(47,164,164,0.2)]">
                    {item.icon}
                  </div>
                  <h3 className="text-[20px] font-semibold text-slate-800 mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-[16px] text-theme-text-muted font-normal leading-[1.6]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. ACCURACY METRICS */}
        <section id="accuracy" className="py-32 bg-theme-bg relative overflow-hidden text-center border-y border-theme-bg-light/30">
          {/* Decorative blurred blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-theme-accent opacity-5 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-theme-accent-light opacity-5 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center group hover:shadow-md transition">
                <div className="text-[48px] md:text-[56px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-theme-accent to-theme-accent-light mb-2 leading-none group-hover:scale-105 transition-transform">94%</div>
                <div className="text-[13px] font-medium tracking-widest uppercase text-theme-text-muted">Predictive Accuracy</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center group hover:shadow-md transition">
                <div className="text-[48px] md:text-[56px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-theme-accent to-theme-accent-light mb-2 leading-none group-hover:scale-105 transition-transform">1M+</div>
                <div className="text-[13px] font-medium tracking-widest uppercase text-theme-text-muted">Signals Processed</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm flex flex-col items-center group hover:shadow-md transition">
                <div className="text-[48px] md:text-[56px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-theme-accent to-theme-accent-light mb-2 leading-none group-hover:scale-105 transition-transform">256-bit</div>
                <div className="text-[13px] font-medium tracking-widest uppercase text-theme-text-muted">Encryption Standard</div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 5. BOTTOM FINAL CTAS */}
      <section className="py-32 bg-theme-bg text-center border-t border-theme-bg-light/20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-[36px] md:text-[48px] font-semibold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Ready to Secure Your Future Health?
          </h2>
          <p className="text-theme-text-muted text-lg mb-12 max-w-xl mx-auto">
            Join thousands of users leveraging predictive AI to stay ahead of potential health risks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full sm:w-auto px-10 py-5 rounded-full font-semibold text-[18px] text-white bg-gradient-to-br from-theme-accent to-theme-accent-light shadow-[0_0_20px_rgba(47,164,164,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(47,164,164,0.5)] active:scale-95"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="w-full sm:w-auto px-10 py-5 rounded-full font-semibold text-[18px] text-theme-accent border border-theme-accent/30 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-theme-bg active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Abstract Decorative Background elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-theme-accent/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-theme-accent-light/5 blur-[100px] rounded-full pointer-events-none"></div>
      </section>
    </div>
  );
}