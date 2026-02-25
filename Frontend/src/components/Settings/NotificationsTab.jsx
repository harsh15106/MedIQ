import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    securityAlerts: true,
    healthReminders: true,
    news: false
  });

  const toggle = (field) => {
    setPrefs(prev => ({ ...prev, [field]: !prev[field] }));
    toast.success("Preference updated");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage how MedIQ contacts you.</p>
      </div>

      <div className="space-y-4">
        <NotificationItem 
          title="Security Alerts" 
          desc="Notify me of new logins or security changes."
          checked={prefs.securityAlerts}
          onToggle={() => toggle('securityAlerts')}
        />
        <NotificationItem 
          title="Health Reminders" 
          desc="AI-driven reminders based on your chronic conditions."
          checked={prefs.healthReminders}
          onToggle={() => toggle('healthReminders')}
        />
      </div>
    </div>
  );
}

function NotificationItem({ title, desc, checked, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onToggle} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
      </label>
    </div>
  );
}