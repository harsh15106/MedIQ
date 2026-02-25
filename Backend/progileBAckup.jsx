import React, { useState,useEffect } from 'react';
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

      if (error) throw error;

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
          // dob and bloodGroup should be added here if they exist in your DB
        });
      }
    } catch (error) {
      toast.error('Error loading profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }; // <--- This brace was missing!

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('profiles')
        .update({
          // Map state keys to your actual DB column names
          phone: profileData.phone,
          city: profileData.city,
          state: profileData.state,
          country: profileData.country,
          pincode: profileData.pincode,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Successfully logged out.');
    navigate('/');
  };

  // Smart Back Button Logic
  const handleBackNavigation = () => {
    if (isEditing) {
      toast.success('Changes saved!');
      setIsEditing(false);
    }
    navigate('/dashboard');
  };

  const inputBaseClass = "w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm shadow-sm transition-colors disabled:bg-slate-100 disabled:dark:bg-slate-800/50 disabled:text-slate-500 disabled:dark:text-slate-400 disabled:cursor-not-allowed bg-white dark:bg-slate-950 dark:text-white";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-12">
      
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={handleBackNavigation}
            className="cursor-pointer p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Account Settings</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- SIDEBAR NAVIGATION --- */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
              <nav className="flex flex-col">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left cursor-pointer flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600 dark:border-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                >
                  <FiUser className="text-lg" /> General Info
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left cursor-pointer flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600 dark:border-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                >
                  <FiLock className="text-lg" /> Password & Security
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left cursor-pointer flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600 dark:border-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                >
                  <FiBell className="text-lg" /> Notifications
                </button>
                <button 
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left cursor-pointer flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'privacy' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600 dark:border-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                >
                  <FiShield className="text-lg" /> Privacy
                </button>
                
                {/* --- LOGOUT BUTTON --- */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-2 pb-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left cursor-pointer flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiLogOut className="text-lg" /> Sign Out
                  </button>
                </div>

              </nav>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative">
              
              {/* =====================================
                  TAB: GENERAL INFORMATION 
                  ===================================== */}
              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  
                  {/* Header & Edit Button */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Personal Information</h2>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition"
                      >
                        <FiEdit2 /> Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {/* Avatar Upload Area */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 text-3xl font-bold border border-teal-200 dark:border-teal-800">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </div>
                    <div>
                      <button 
                        disabled={!isEditing}
                        className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Change Photo
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name <span className="text-slate-400 font-normal ml-1">(Fixed)</span></label>
                        <input type="text" name="firstName" value={profileData.firstName} disabled={true} className={inputBaseClass} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name <span className="text-slate-400 font-normal ml-1">(Fixed)</span></label>
                        <input type="text" name="lastName" value={profileData.lastName} disabled={true} className={inputBaseClass} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                        <input type="email" name="email" value={profileData.email} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                        <input type="tel" name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                        <input type="date" name="dob" value={profileData.dob} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
                        <select name="bloodGroup" value={profileData.bloodGroup} onChange={handleChange} disabled={!isEditing} className={inputBaseClass}>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                          <input type="text" name="city" value={profileData.city} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State</label>
                          <input type="text" name="state" value={profileData.state} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Country</label>
                          <input type="text" name="country" value={profileData.country} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                          <input type="text" name="pincode" value={profileData.pincode} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 animate-fade-in">
                        <button 
                          type="button" 
                          onClick={() => setIsEditing(false)}
                          className="cursor-pointer flex items-center gap-2 px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition hover:text-red-300 dark:hover:text-red-400"
                        >
                          <FiX className="text-lg" /> Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition shadow-md"
                        >
                          <FiSave className="text-lg" /> Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* =====================================
                  TAB: NOTIFICATIONS
                  ===================================== */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Notification Preferences</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Choose what updates you want to receive from MedIQ.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Security Alerts</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get notified about new logins and password changes.</p>
                      </div>
                      <ToggleSwitch checked={notifications.securityAlerts} onChange={() => handleToggle('notifications', 'securityAlerts')} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Health Follow-ups</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive reminders to check in on previous symptoms.</p>
                      </div>
                      <ToggleSwitch checked={notifications.healthReminders} onChange={() => handleToggle('notifications', 'healthReminders')} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Product Updates & News</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hear about new AI features and platform updates.</p>
                      </div>
                      <ToggleSwitch checked={notifications.productUpdates} onChange={() => handleToggle('notifications', 'productUpdates')} />
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================
                  TAB: PRIVACY & DATA
                  ===================================== */}
              {activeTab === 'privacy' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Privacy & Data Control</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Manage how your health data is used and stored.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="pr-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">AI Training Consent</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Allow MedIQ to use your anonymized symptom data to improve our AI models. Your name and personal details are never shared.</p>
                      </div>
                      <ToggleSwitch checked={privacy.aiTrainingConsent} onChange={() => handleToggle('privacy', 'aiTrainingConsent')} />
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Export Health Data</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Download a complete copy of your medical profile, chat history, and uploaded records.</p>
                      <button 
                        onClick={() => toast.success('Your data export has started. We will email you a secure link.')}
                        className="cursor-pointer px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-lg transition"
                      >
                        Request Data Export
                      </button>
                    </div>

                    <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 mb-4">Permanently delete your MedIQ account and wipe all health records. This action cannot be undone.</p>
                      <button 
                        onClick={() => {
                          if(window.confirm('Are you absolutely sure you want to delete your account? All medical data will be lost.')) {
                            toast.success('Account deletion scheduled.');
                          }
                        }}
                        className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================
                  TAB: SECURITY (Placeholder)
                  ===================================== */}
              {activeTab === 'security' && (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                    <FiLock className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password & Security</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">This section is currently under construction. Check back soon to update your passwords!</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Reusable Tailwind Toggle Switch Component
function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer cursor-pointer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
    </label>
  );
}

// --- This function is used to fetch the profile data when the component mounts ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient'; //
import toast from 'react-hot-toast';

// Import your split child components

import GeneralTab from '../components/Settings/GeneralTab';
import SecurityTab from '../components/Settings/SecurityTab';
import NotificationsTab from '../components/Settings/NotificationsTab';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global state for all user data
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
    bloodGroup: ''
  });

  // 1. Fetch data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser(); //

        if (!user) return navigate('/login');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(); //

        if (error) throw error;

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
            bloodGroup: data.blood_group || 'Unknown'
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // 2. Global Change Handler shared with children
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // 3. Global Save Handler for Database Updates
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: profileData.phone,
          city: profileData.city,
          state: profileData.state,
          country: profileData.country,
          pincode: profileData.pincode,
          blood_group: profileData.bloodGroup,
          dob: profileData.dob
        })
        .eq('id', user.id); //

      if (error) throw error;
      toast.success('Database updated!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading MediIQ Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-8">
        
        {/* Pass state-setter to Sidebar to switch tabs */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
          {activeTab === 'general' && (
            <GeneralTab 
              profileData={profileData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleChange={handleChange}
              handleSave={handleSave}
            />
          )}

          {activeTab === 'security' && <SecurityTab />}
          
          {activeTab === 'notifications' && <NotificationsTab />}
        </section>
      </main>
    </div>
  );
}