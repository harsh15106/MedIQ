import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  return (
    // Added backdrop-blur and a semi-transparent dark background for a premium feel
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm fixed w-full z-50 top-0 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 font-bold text-2xl text-teal-600 dark:text-teal-400">
            <span className="text-3xl">⚕️</span> MedIQ
          </Link>

          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition">Features</a>
            <a href="#faq" className="text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition">FAQ</a>
            <a href="#contact" className="text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition">Contact</a>
          </div>

          <div className="flex space-x-4 items-center">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            <Link 
              to="/auth?mode=login" 
              className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-2 rounded-md font-medium transition"
            >
              Login
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="bg-teal-600 text-white hover:bg-teal-500 px-5 py-2 rounded-md font-medium transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}