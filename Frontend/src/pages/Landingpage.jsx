import React, { useState } from 'react';
import { FiActivity, FiShield, FiCpu } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const features = [
    {
      icon: <FiCpu className="text-3xl text-teal-600 dark:text-teal-400" />,
      title: "AI Symptom Analysis",
      desc: "Input your symptoms and receive instant, AI-driven insights to help you understand potential causes and decide your next steps."
    },
    {
      icon: <FiShield className="text-3xl text-teal-600 dark:text-teal-400" />,
      title: "Secure Health Records",
      desc: "Store your medical history, test results, and health data securely in one private, encrypted digital vault."
    },
    {
      icon: <FiActivity className="text-3xl text-teal-600 dark:text-teal-400" />,
      title: "24/7 Health Tracking",
      desc: "Monitor your ongoing symptoms and overall wellness anytime, anywhere with your always-on intelligent health companion."
    }
  ];

  const faqs = [
    {
      question: "Is MedIQ a replacement for my primary care doctor?",
      answer: "No. MedIQ is designed to assist you by organizing your health data and providing preliminary AI insights. Always consult a certified medical professional for official diagnoses and treatment."
    },
    {
      question: "How secure is my medical data?",
      answer: "Your privacy is our top priority. MedIQ uses end-to-end encryption and complies with strict healthcare data regulations (like HIPAA) to ensure your personal health information is completely secure."
    },
    {
      question: "Can I share my records with my current doctor?",
      answer: "Yes! MedIQ allows you to generate secure, temporary access links or export your health summaries as PDFs to share directly with your healthcare providers."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-800 transition-colors duration-300">
      <Navbar />
      
      <main>
        <Hero />

        {/* Features Section - unified dark slate background */}
        <section id="features" className="py-24 bg-white dark:bg-slate-950 border-b border-slate-50 dark:border-slate-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Why Choose MedIQ?
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Take control of your health with advanced, user-friendly AI technology designed exclusively for your peace of mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 relative group"
                >
                  <div className="w-16 h-16 bg-teal-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - slightly lighter slate to differentiate the section visually */}
        <section id="faq" className="py-24 bg-teal-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-slate-950 border border-teal-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                  <button
                    className="w-full px-6 py-5 text-left font-semibold text-slate-900 dark:text-white flex justify-between items-center focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    {faq.question}
                    <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      ▼
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 border-t border-teal-50 dark:border-slate-800 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}