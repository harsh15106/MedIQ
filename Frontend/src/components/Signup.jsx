import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient'; // Import your client
import toast from 'react-hot-toast';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. State for all form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    gender: '',
    height: '',
    weight: '',
    email: '',
    password: '',
    confirmPassword: '',
    chronicConditions: '',
    currentMedications: '',
    knownAllergies: '',
    pastSurgeries: ''
  });

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    // ONLY do the Auth SignUp. 
    // The Trigger we added to Supabase will handle the 'profiles' table for you.
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          age: Number(formData.age),
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          gender: formData.gender,
          height: formData.height ? Number(formData.height) : null,
          weight: formData.weight ? Number(formData.weight) : null,
          chronic_conditions: formData.chronicConditions,
          current_medications: formData.currentMedications,
          known_allergies: formData.knownAllergies,
          past_surgeries: formData.pastSurgeries,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signup successful! Check your email or proceed to onboarding.");
      navigate('/onboarding');
    }

    setLoading(false);
  };
  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="First Name" name="firstName" type="text" required onChange={handleChange} />
        <InputField label="Last Name" name="lastName" type="text" onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Age" name="age" type="number" required onChange={handleChange} />
        <InputField label="Phone Number" name="phone" type="tel" required onChange={handleChange} />
      </div>

      <div className="p-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60">
        <p className="text-xs font-bold text-theme-text-muted uppercase tracking-widest mb-4">Location (Required)</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="City" name="city" type="text" required onChange={handleChange} />
          <InputField label="State" name="state" type="text" required onChange={handleChange} />
          <InputField label="Country" name="country" type="text" required onChange={handleChange} />
          <InputField label="Pincode" name="pincode" type="text" required onChange={handleChange} />
        </div>
      </div>

      <div className="p-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60">
        <p className="text-xs font-bold text-theme-text-muted uppercase tracking-widest mb-4">Physical Attributes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700 ">Gender</label>
            <select
              name="gender"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none transition-colors text-sm bg-white/50 backdrop-blur-sm"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <InputField label="Height (cm)" name="height" type="number" onChange={handleChange} />
          <InputField label="Weight (kg)" name="weight" type="number" onChange={handleChange} />
        </div>
      </div>

      <InputField label="Email Address" name="email" type="email" required onChange={handleChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-semibold text-slate-700 ">Password *</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none text-sm pr-10 transition-colors bg-white/50 backdrop-blur-sm"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-400 hover:text-theme-accent transition-colors">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-semibold text-slate-700 ">Confirm Password *</label>
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none text-sm pr-10 transition-colors bg-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 mt-6 bg-gradient-to-r from-theme-accent to-theme-accent-light text-white font-semibold rounded-full hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-ai-glow hover:shadow-ai-glow-hover flex justify-center items-center cursor-pointer"
      >
        {loading ? 'Initializing Profile...' : 'Begin AI Onboarding'}
      </button>
    </form>
  );
}

// 4. Update InputField to accept 'name' and 'onChange'
function InputField({ label, name, type, required, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700 ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        onChange={onChange}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-theme-accent outline-none transition-colors text-sm bg-white/50 backdrop-blur-sm"
      />
    </div>
  );
}