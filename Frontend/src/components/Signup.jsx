import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send them to onboarding after "successful" signup
    navigate('/onboarding');
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="First Name" type="text" required={true} />
        <InputField label="Last Name" type="text" required={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Age" type="number" required={true} />
        <InputField label="Phone Number" type="tel" required={true} />
      </div>
      
      {/* Location Box with Dark Mode */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Location (Required)</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="City" type="text" required={true} />
          <InputField label="State" type="text" required={true} />
          <InputField label="Country" type="text" required={true} />
          <InputField label="Pincode" type="text" required={true} />
        </div>
      </div>

      <InputField label="Email Address" type="email" required={true} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password <span className="text-red-500">*</span></label>
          <input 
            type={showPassword ? "text" : "password"} 
            required 
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors text-sm shadow-sm pr-10" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition mt-3">
            {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
          </button>
        </div>
        
        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password <span className="text-red-500">*</span></label>
          <input 
            type={showPassword ? "text" : "password"} 
            required 
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors text-sm shadow-sm pr-10" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition mt-3">
            {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
          </button>
        </div>
      </div>

      <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-md">
        Create Account
      </button>
    </form>
  );
}

// Helper component updated for Dark Mode
function InputField({ label, type, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        required={required}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors text-sm shadow-sm"
      />
    </div>
  );
}