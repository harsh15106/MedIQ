import React, { useState } from 'react';
import { supabase } from '../../utils/SupabaseClient'; //
import { FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SecurityTab() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    }); //

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Password & Security</h2>
        <p className="text-slate-500  text-sm">Update your password to keep your medical data secure.</p>
      </div>

      <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">New Password</label>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300  rounded-lg  outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300  rounded-lg  outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}