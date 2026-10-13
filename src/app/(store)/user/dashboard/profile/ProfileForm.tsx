"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import bdData from "@/lib/bdData.json";

export default function ProfileForm({ 
  user, 
  updateAction 
}: { 
  user: any; 
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }> 
}) {
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(user?.city || "");
  const thanasList = selectedCity && bdData[selectedCity as keyof typeof bdData] ? bdData[selectedCity as keyof typeof bdData] : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateAction(formData);
      
      if (res.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input 
          type="email" 
          defaultValue={user?.email} 
          disabled 
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed" 
        />
        <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
        <input 
          type="text" 
          name="name"
          defaultValue={user?.name} 
          required
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow" 
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
        <input 
          type="tel" 
          name="phone"
          defaultValue={user?.phone} 
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow" 
          placeholder="+8801XXXXXXXXX"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">City / District</label>
          <div className="relative">
            <select 
              name="city" 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow appearance-none cursor-pointer"
            >
              <option value="">Select District</option>
              {Object.keys(bdData).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Area / Thana</label>
          <div className="relative">
            <select 
              name="thana" 
              defaultValue={user?.thana || ""} 
              disabled={!selectedCity} 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Area/Thana</option>
              {thanasList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">House & Street Address</label>
        <textarea 
          name="address"
          defaultValue={user?.address} 
          rows={2}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow resize-none" 
          placeholder="House/Flat No, Road No"
        />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
