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

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Location (Required)</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="City" name="city" type="text" required onChange={handleChange} />
          <InputField label="State" name="state" type="text" required onChange={handleChange} />
          <InputField label="Country" name="country" type="text" required onChange={handleChange} />
          <InputField label="Pincode" name="pincode" type="text" required onChange={handleChange} />
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Physical Attributes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
            <select
              name="gender"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors text-sm shadow-sm"
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
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password *</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm pr-10"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="flex flex-col gap-1 relative">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm pr-10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}

// 4. Update InputField to accept 'name' and 'onChange'
function InputField({ label, name, type, required, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        onChange={onChange}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors text-sm shadow-sm"
      />
    </div>
  );
}