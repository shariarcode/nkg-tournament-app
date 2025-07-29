
import React, { useState, useContext, useRef } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { PencilIcon } from '../components/Icons';

const Profile: React.FC = () => {
  const { player, setPlayer, registrations } = useContext(AppContext) as AppContextType;
  const [name, setName] = useState(player.name);
  const [freeFireId, setFreeFireId] = useState(player.freeFireId);
  const [phone, setPhone] = useState(player.phone);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayer(prev => ({ ...prev, name, freeFireId, phone }));
    setIsEditing(false);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPicUrl = reader.result as string;
        setPlayer(prev => ({ ...prev, profilePicUrl: newPicUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const playerRegistrations = registrations.filter(r => r.playerId === player.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:space-x-8">
          <div className="relative mb-6 md:mb-0">
            <img src={player.profilePicUrl} alt="Profile" className="w-32 h-32 rounded-full ring-4 ring-red-500 object-cover" />
            {!player.isAnonymous && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600 transition"
                aria-label="Change profile picture"
              >
                <PencilIcon className="w-5 h-5"/>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden"/>
          </div>
          <div className="flex-1 w-full">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Player Name" />
                <input type="text" value={freeFireId} onChange={e => setFreeFireId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Free Fire ID" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Phone Number" />
                <div className="flex space-x-4">
                  <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white">{player.name}</h1>
                <p className="text-gray-400"><strong>Email:</strong> {player.email || 'N/A'}</p>
                <p className="text-gray-400"><strong>Free Fire ID:</strong> {player.freeFireId}</p>
                <p className="text-gray-400"><strong>Phone:</strong> {player.phone}</p>
                {!player.isAnonymous && (
                    <button onClick={() => setIsEditing(true)} className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition">Edit Profile</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">My Tournament Registrations</h2>
        {playerRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-600 text-sm text-gray-400">
                <tr>
                  <th className="p-2">Tournament</th>
                  <th className="p-2">bKash No.</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {playerRegistrations.map(reg => (
                  <tr key={reg.id} className="border-b border-gray-700 last:border-0">
                    <td className="p-3">{reg.tournamentName}</td>
                    <td className="p-3">{reg.bkashNumber}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        reg.status === 'Pending' ? 'bg-yellow-500 text-black' :
                        reg.status === 'Approved' ? 'bg-green-500 text-white' :
                        'bg-red-500 text-white'
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
          <p className="text-gray-400 text-center py-4">You haven't joined any tournaments yet. Sign in and join one!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;