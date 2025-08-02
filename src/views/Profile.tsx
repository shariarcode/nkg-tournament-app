
import React, { useState, useContext, useRef } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { PencilIcon } from '../components/Icons';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const Profile: React.FC = () => {
  const { player, setPlayer, registrations } = useContext(AppContext) as AppContextType;
  const [name, setName] = useState(player.name);
  const [freeFireId, setFreeFireId] = useState(player.freeFireId);
  const [phone, setPhone] = useState(player.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (player.isAnonymous) return;

    const updates: ProfileUpdate = { name, free_fire_id: freeFireId, phone };

    const { error } = await (supabase
      .from('profiles') as any)
      .update(updates)
      .eq('id', player.id);

    if (error) {
      alert(`Error updating profile: ${error.message}`);
    } else {
      setPlayer(prev => ({ ...prev, name, freeFireId, phone }));
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (player.isAnonymous || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${player.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    try {
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        if (!urlData) throw new Error("Could not get public URL for avatar");
        
        const newPicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

        const picUpdate: ProfileUpdate = { profile_pic_url: newPicUrl };
        const { error: updateError } = await (supabase
            .from('profiles') as any)
            .update(picUpdate)
            .eq('id', player.id);

        if (updateError) throw updateError;

        setPlayer(prev => ({ ...prev, profilePicUrl: newPicUrl }));
        alert("Profile picture updated!");

    } catch (error: any) {
        alert(`Failed to update profile picture: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:space-x-8">
          <div className="relative mb-6 md:mb-0">
            <img src={player.profilePicUrl} alt="Profile" className="w-32 h-32 rounded-full ring-4 ring-brand-green object-cover" />
             {isUploading && <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
            {!player.isAnonymous && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 bg-dark-3 p-2 rounded-full text-white hover:bg-white/20 transition disabled:opacity-50"
                aria-label="Change profile picture"
              >
                <PencilIcon className="w-5 h-5"/>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden"/>
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Player Name" />
                <input type="text" value={freeFireId} onChange={e => setFreeFireId(e.target.value)} className="input-field" placeholder="Free Fire ID" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="Phone Number" />
                <div className="flex space-x-4 pt-2">
                  <button type="submit" className="flex-1 btn btn-primary">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 btn bg-dark-3 text-light-1 hover:bg-white/10">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 font-sans">
                <h1 className="text-4xl font-display text-white">{player.name}</h1>
                <p className="text-light-2"><strong>Email:</strong> {player.email || 'N/A'}</p>
                <p className="text-light-2"><strong>Free Fire ID:</strong> {player.freeFireId}</p>
                <p className="text-light-2"><strong>Phone:</strong> {player.phone}</p>
                {!player.isAnonymous && (
                    <button onClick={() => setIsEditing(true)} className="mt-4 btn btn-primary">Edit Profile</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">My Tournament Registrations</h2>
        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b-2 border-white/10 text-sm text-light-2 uppercase">
                <tr>
                  <th className="p-3">Tournament</th>
                  <th className="p-3">bKash No.</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} className="border-b border-white/10 last:border-0 hover:bg-dark-3/50">
                    <td className="p-3 text-light-1">{reg.tournamentName}</td>
                    <td className="p-3 text-light-2">{reg.bkash_number}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        reg.status === 'Pending' ? 'bg-brand-yellow text-dark-1' :
                        reg.status === 'Approved' ? 'bg-brand-green text-dark-1' :
                        'bg-red-800 text-white'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-light-2 text-center py-4 font-sans">You haven't joined any tournaments yet. Go to the Tournaments page to join one!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
