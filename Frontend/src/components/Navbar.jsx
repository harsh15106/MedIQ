import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-500 ease-in-out ${isScrolled
      ? 'bg-white/80 backdrop-blur-xl border-b border-theme-bg-light/20 shadow-lg py-2'
      : 'bg-transparent border-b border-transparent py-3'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">

          <Link
            to="/"
            onClick={scrollToTop}
            className={`flex-shrink-0 flex items-center gap-2 font-semibold text-2xl tracking-tight transition-colors duration-300 ${isScrolled ? 'text-theme-accent' : 'text-white'}`}
          >
            <img src="/LOGO.png" alt="MedIQ Logo" className="w-8 h-8 object-contain" /> MedIQ
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {['How It Works', 'Features', 'Accuracy'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className={`text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${isScrolled ? 'text-theme-text/70 hover:text-theme-accent' : 'text-white/80 hover:text-white'
                  }`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex space-x-4 items-center">
            <Link
              to="/auth?mode=login"
              className={`text-sm font-medium transition-colors duration-300 hover:opacity-80 ${isScrolled ? 'text-theme-text/80' : 'text-white'}`}
            >
              Login
            </Link>
            <Link
              to="/auth?mode=signup"
              className="bg-theme-accent text-white hover:bg-theme-accent-light px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
