import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="font-bold text-2xl text-teal-500 mb-4 flex items-center gap-2">
              <span>⚕️</span> MedIQ
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering patients and providers with intelligent healthcare insights and secure medical management.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-teal-400 transition">Symptom Checker</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">For Doctors</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">Patient Portal</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-teal-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">Data Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} MedIQ Healthcare. All rights reserved.</p>
          <p className="mt-4 md:mt-0 text-slate-500">Not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
}