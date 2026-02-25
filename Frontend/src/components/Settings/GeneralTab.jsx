export default function GeneralTab({ profileData, isEditing, setIsEditing, handleChange, handleSave }) {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Personal Information</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 rounded-lg">
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Reuse your InputField components here */}
           <input name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing} />
           {/* ... other fields ... */}
        </div>
        
        {isEditing && (
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg">Save</button>
          </div>
        )}
      </form>
    </div>
  );
}