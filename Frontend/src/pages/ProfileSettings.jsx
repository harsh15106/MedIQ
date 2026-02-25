import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { FiArrowLeft, FiUser, FiLock, FiBell, FiShield, FiSave, FiEdit2, FiX, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- STATE: GENERAL PROFILE ---
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    dob: '',
    bloodGroup: 'Unknown'
  });

  // --- STATE: PREFERENCES ---
  const [notifications, setNotifications] = useState({
    securityAlerts: true,
    healthReminders: true,
    productUpdates: false,
  });

  const [privacy, setPrivacy] = useState({
    aiTrainingConsent: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: user.email || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          pincode: data.pincode || '',
          dob: data.dob || '',
          bloodGroup: data.blood_group || 'Unknown',
        });
      }
    } catch (error) {
      toast.error('Error loading profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (category, field) => {
    if (category === 'notifications') {
      setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
    } else {
      setPrivacy(prev => ({ ...prev, [field]: !prev[field] }));
    }
    toast.success('Preference updated locally');
  };

  const handleSave = async (e) => {
  if (e) e.preventDefault();
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // UPSERT is "Update or Insert"
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id, // Primary key is required for upsert to work
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        pincode: profileData.pincode,
        //age: parseInt(profileData.age) || null, // Convert string to number for SQL 'int'
        blood_group: profileData.bloodGroup,    // Match your SQL column name
        dob: profileData.dob || null
      });

    if (error) throw error;
    
    toast.success('Profile saved successfully!');
    setIsEditing(false);
  } catch (error) {
    toast.error('Failed to update profile');
    console.error("Supabase Error:", error);
  }
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Successfully logged out.');
    navigate('/');
  };

  const handleBackNavigation = () => {
    navigate('/dashboard');
  };

  const inputBaseClass = "w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm transition-colors disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:text-slate-500 disabled:dark:text-slate-400 disabled:cursor-not-allowed bg-white dark:bg-slate-950 dark:text-white";

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-12">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={handleBackNavigation} className="cursor-pointer p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Account Settings</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <nav className="flex flex-col">
                <TabButton id="general" icon={<FiUser />} label="General Info" active={activeTab} onClick={setActiveTab} />
                <TabButton id="security" icon={<FiLock />} label="Security" active={activeTab} onClick={setActiveTab} />
                <TabButton id="notifications" icon={<FiBell />} label="Notifications" active={activeTab} onClick={setActiveTab} />
                <TabButton id="privacy" icon={<FiShield />} label="Privacy" active={activeTab} onClick={setActiveTab} />
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <FiLogOut /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              
              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                        <FiEdit2 /> Edit Profile
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name (Fixed)" name="firstName" value={profileData.firstName} disabled={true} className={inputBaseClass} />
                      <Input label="Last Name (Fixed)" name="lastName" value={profileData.lastName} disabled={true} className={inputBaseClass} />
                      <Input label="Email Address" name="email" type="email" value={profileData.email} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      <Input label="Phone Number" name="phone" type="tel" value={profileData.phone} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      <Input label="Date of Birth" name="dob" type="date" value={profileData.dob} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold">Blood Group</label>
                        <select name="bloodGroup" value={profileData.bloodGroup} onChange={handleChange} disabled={!isEditing} className={inputBaseClass}>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="City" name="city" value={profileData.city} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="State" name="state" value={profileData.state} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="Country" name="country" value={profileData.country} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="Pincode" name="pincode" value={profileData.pincode} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      </div>
                    </div>
                    {isEditing && (
                      <div className="pt-6 flex justify-end gap-3"><button
  type="button"
  onClick={() => {
    setProfileData(originalData);
    setIsEditing(false);
  }}
>
  Cancel
</button>
                        <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold">Save Changes</button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Notifications</h2>
                   <ToggleRow title="Security Alerts" description="Logins and password changes" checked={notifications.securityAlerts} onChange={() => handleToggle('notifications', 'securityAlerts')} />
                   <ToggleRow title="Health Follow-ups" description="Reminders for check-ins" checked={notifications.healthReminders} onChange={() => handleToggle('notifications', 'healthReminders')} />
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Privacy</h2>
                   <ToggleRow title="AI Training" description="Anonymized data usage" checked={privacy.aiTrainingConsent} onChange={() => handleToggle('privacy', 'aiTrainingConsent')} />
                </div>
              )}

              {activeTab === 'security' && (
                <div className="text-center py-12">
                  <FiLock className="text-4xl mx-auto mb-4 text-slate-400" />
                  <p>Security settings coming soon.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function TabButton({ id, icon, label, active, onClick }) {
  const isActive = active === id;
  return (
    <button onClick={() => onClick(id)} className={`w-full text-left flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${isActive ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600' : 'text-slate-600 dark:text-slate-400 border-l-4 border-transparent hover:bg-slate-50'}`}>
      {icon} {label}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <input {...props} />
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
    </label>
  );
}