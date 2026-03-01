import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { FiArrowLeft, FiUser, FiLock, FiBell, FiShield, FiActivity, FiSave, FiEdit2, FiX, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "Weight or Height is not provided. Cannot calculate BMI.";
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to meters
    if (w <= 0 || h <= 0) return "Invalid weight or height.";
    const bmi = (w / (h * h)).toFixed(1);

    let category = '';
    if (bmi < 18.5) category = '(Underweight)';
    else if (bmi < 25) category = '(Normal)';
    else if (bmi < 30) category = '(Overweight)';
    else category = '(Obese)';

    return `${bmi} ${category}`;
  };

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
    gender: '',
    weight: '',
    height: ''
  });

  // --- STATE: MEDICAL HISTORY ---
  const [medicalData, setMedicalData] = useState({
    bloodGroup: 'Unknown',
    chronicConditions: '',
    currentMedications: '',
    allergies: '',
    surgeries: ''
  });

  // --- STATE: SECURITY ---
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setIsEditing(false); // Reset editing mode when switching tabs
  }, [activeTab]);

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

      const { data: medData, error: medError } = await supabase
        .from('Health_Records')
        .select('blood_group, chronic_conditions, current_medications, allergies, surgeries')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
          gender: data.gender || '',
          weight: data.weight || '',
          height: data.height || ''
        });
      }

      if (medData) {
        setMedicalData({
          bloodGroup: medData.blood_group || 'Unknown',
          chronicConditions: medData.chronic_conditions || '',
          currentMedications: medData.current_medications || '',
          allergies: medData.allergies || '',
          surgeries: medData.surgeries || ''
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

  const handleMedicalChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!securityData.currentPassword) {
      return toast.error("Please enter your current password");
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setIsUpdatingPassword(true);

    // 1. Get the current user email to re-authenticate
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: securityData.currentPassword
    });

    if (signInError) {
      setIsUpdatingPassword(false);
      return toast.error("Incorrect current password.");
    }

    // 3. Current password is correct, update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: securityData.newPassword
    });

    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success("Password updated successfully!");
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setIsUpdatingPassword(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (activeTab === 'general') {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            phone: profileData.phone,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
            pincode: profileData.pincode,
            dob: profileData.dob || null,
            gender: profileData.gender || null,
            weight: profileData.weight ? Number(profileData.weight) : null,
            height: profileData.height ? Number(profileData.height) : null
          });

        if (error) throw error;
        toast.success('Profile saved successfully!');
      } else if (activeTab === 'medical') {
        const { data: existingRecords } = await supabase.from('Health_Records').select('id').eq('user_id', user.id).limit(1).maybeSingle();

        if (existingRecords) {
          const { error } = await supabase.from('Health_Records').update({
            blood_group: medicalData.bloodGroup,
            chronic_conditions: medicalData.chronicConditions,
            current_medications: medicalData.currentMedications,
            allergies: medicalData.allergies || null,
            surgeries: medicalData.surgeries || null
          }).eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('Health_Records').insert([{
            user_id: user.id,
            blood_group: medicalData.bloodGroup,
            chronic_conditions: medicalData.chronicConditions,
            current_medications: medicalData.currentMedications,
            allergies: medicalData.allergies || null,
            surgeries: medicalData.surgeries || null
          }]);
          if (error) throw error;
        }
        toast.success('Medical History saved successfully!');
      }
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update details');
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

  const inputBaseClass = "w-full px-4 py-3 border border-slate-200 rounded-[1rem] focus:ring-2 focus:ring-theme-accent outline-none text-sm shadow-sm transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed bg-white font-light text-slate-700";

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-surface text-theme-text transition-colors duration-300 pb-12 font-sans">
        <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-theme-bg-light/20 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="w-10 h-10 bg-theme-bg-light/30 rounded-full animate-pulse"></div>
            <div className="w-48 h-6 bg-theme-bg-light/30 rounded animate-pulse"></div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-[2rem] shadow-sm border border-theme-bg-light/20 overflow-hidden py-2 animate-pulse">
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-12 bg-theme-bg-light/20 rounded-xl"></div>
                  <div className="h-12 bg-theme-bg-light/20 rounded-xl"></div>
                  <div className="h-12 bg-theme-bg-light/20 rounded-xl"></div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-theme-bg-light/20 animate-pulse">
                <div className="h-8 bg-theme-bg-light/20 rounded w-1/3 mb-8"></div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-theme-bg-light/20 rounded w-1/4"></div>
                      <div className="h-12 bg-theme-bg-light/20 rounded-[1rem]"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-theme-bg-light/20 rounded w-1/4"></div>
                      <div className="h-12 bg-theme-bg-light/20 rounded-[1rem]"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-theme-bg-light/20 rounded w-1/4"></div>
                      <div className="h-12 bg-theme-bg-light/20 rounded-[1rem]"></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-theme-bg-light/20 rounded w-1/4"></div>
                      <div className="h-12 bg-theme-bg-light/20 rounded-[1rem]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-300 pb-12 font-sans relative overflow-x-hidden">

      {/* Abstract light burst bg */}
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-theme-accent opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-theme-bg-light/30 px-6 py-4 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={handleBackNavigation} className="cursor-pointer p-2 text-theme-text-muted hover:text-theme-accent bg-theme-surface hover:bg-theme-bg-light/30 rounded-full transition">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">AI Model Preferences</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white overflow-hidden py-2 hover:shadow-md transition-shadow">
              <nav className="flex flex-col">
                <TabButton id="general" icon={<FiUser />} label="General Info" active={activeTab} onClick={setActiveTab} />
                <TabButton id="medical" icon={<FiActivity />} label="Medical History" active={activeTab} onClick={setActiveTab} />
                <TabButton id="security" icon={<FiLock />} label="Security" active={activeTab} onClick={setActiveTab} />
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-500/80 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer">
                  <FiLogOut /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-white transition-all hover:shadow-md">

              {activeTab === 'general' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Personal Information</h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-theme-surface text-theme-accent hover:bg-theme-bg-light/30 rounded-[1rem] text-sm font-semibold transition-colors cursor-pointer border border-theme-accent/10">
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
                        <label className="text-sm font-medium text-slate-700">Gender</label>
                        <select name="gender" value={profileData.gender} onChange={handleChange} disabled={!isEditing} className={inputBaseClass}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-theme-bg-light/20">
                      <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-widest mb-4">Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="City" name="city" value={profileData.city} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="State" name="state" value={profileData.state} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="Country" name="country" value={profileData.country} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                        <Input label="Pincode" name="pincode" value={profileData.pincode} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-theme-bg-light/20">
                      <h3 className="text-xs font-semibold text-theme-accent opacity-80 uppercase tracking-widest mb-4">Physical Attributes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Weight (kg)" name="weight" type="number" value={profileData.weight} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. 70" />
                        <Input label="Height (cm)" name="height" type="number" value={profileData.height} onChange={handleChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. 175" />
                      </div>
                    </div>

                    {/* --- BMI DISPLAY --- */}
                    <div className="mt-6 p-4 bg-theme-surface rounded-[1rem] border border-theme-bg-light/30">
                      <h3 className="text-sm font-medium text-theme-accent mb-1">Calculated BMI</h3>
                      <p className="text-sm text-theme-text/80 font-light">
                        {calculateBMI(profileData.weight, profileData.height)}
                      </p>
                    </div>

                    {isEditing && (
                      <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => { fetchProfile(); setIsEditing(false); }} className="px-5 text-theme-text-muted hover:text-slate-900 cursor-pointer transition-colors font-medium"> Cancel </button>
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full font-semibold shadow-ai-glow hover:shadow-ai-glow-hover active:scale-95 transition-all duration-300 cursor-pointer">Save Changes</button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'medical' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Medical History</h2>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-theme-surface text-theme-accent hover:bg-theme-bg-light/30 rounded-[1rem] text-sm font-semibold transition-colors cursor-pointer border border-theme-accent/10">
                        <FiEdit2 /> Edit History
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Blood Group</label>
                        <select name="bloodGroup" value={medicalData.bloodGroup} onChange={handleMedicalChange} disabled={!isEditing} className={inputBaseClass}>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      <div className="hidden md:block"></div>
                      <Input label="Chronic Conditions" name="chronicConditions" value={medicalData.chronicConditions} onChange={handleMedicalChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. Asthma, Diabetes" />
                      <Input label="Current Medications" name="currentMedications" value={medicalData.currentMedications} onChange={handleMedicalChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. Lisinopril 10mg" />
                      <Input label="Allergies" name="allergies" value={medicalData.allergies} onChange={handleMedicalChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. Penicillin, Peanuts" />
                      <Input label="Surgeries" name="surgeries" value={medicalData.surgeries} onChange={handleMedicalChange} disabled={!isEditing} className={inputBaseClass} placeholder="e.g. Appendectomy (2015)" />
                    </div>

                    {isEditing && (
                      <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => { fetchProfile(); setIsEditing(false); }} className="px-5 text-theme-text-muted hover:text-slate-900 cursor-pointer transition-colors font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full font-semibold shadow-ai-glow hover:shadow-ai-glow-hover active:scale-95 transition-all duration-300 cursor-pointer">Save Changes</button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Security Vault</h2>
                    <p className="text-theme-text-muted text-sm mt-1 font-normal">Update your password to keep your health data encrypted.</p>
                  </div>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={handleSecurityChange}
                        className={inputBaseClass}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={securityData.newPassword}
                        onChange={handleSecurityChange}
                        className={inputBaseClass}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={securityData.confirmPassword}
                        onChange={handleSecurityChange}
                        className={inputBaseClass}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-6 py-3 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white rounded-full font-semibold shadow-ai-glow hover:shadow-ai-glow-hover active:scale-95 disabled:opacity-50 transition-all duration-300 cursor-pointer"
                      >
                        {isUpdatingPassword ? 'Encrypting...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
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
    <button onClick={() => onClick(id)} className={`w-full text-left flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors cursor-pointer ${isActive ? 'bg-theme-surface text-theme-accent border-l-4 border-theme-accent' : 'text-theme-text/80 font-light border-l-4 border-transparent hover:bg-theme-surface'}`}>
      {icon} {label}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input {...props} />
    </div>
  );
}
