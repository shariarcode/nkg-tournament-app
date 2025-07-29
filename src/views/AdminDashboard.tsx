import React, { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Registration, Tournament, LeaderboardEntry } from '../types';
import { PencilIcon, XMarkIcon } from '../components/Icons';
import { supabase } from '../services/supabase';

const AdminDashboard: React.FC = () => {
  const { 
    notice, 
    setNotice, 
    tournaments,
    setTournaments, 
    leaderboard,
    setLeaderboard
  } = useContext(AppContext) as AppContextType;

  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [newNotice, setNewNotice] = useState(notice);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editableLeaderboard, setEditableLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('registrations').select('*, profiles(name, free_fire_id), tournaments(name)');
            if (error) throw error;
            const formattedData = data.map(r => ({
                ...r,
                playerName: (r.profiles as any)?.name || 'Unknown Player',
                playerFreeFireId: (r.profiles as any)?.free_fire_id || 'N/A',
                tournamentName: (r.tournaments as any)?.name || 'Unknown Tournament'
            }));
            setAllRegistrations(formattedData);
        } catch (error) {
            console.error("Error fetching registrations for admin:", error);
            alert("Could not fetch registrations.");
        } finally {
            setLoading(false);
        }
    };
    fetchAdminData();
    setEditableLeaderboard(JSON.parse(JSON.stringify(leaderboard)));
  }, [leaderboard]);
  
  const handleUpdateNotice = () => {
    // In a real app, this would be saved to a database table.
    setNotice(newNotice);
    alert("Notice updated! (Client-side only for this demo)");
  };
  
  const approveRegistration = async (registrationId: number) => {
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'Approved' })
      .eq('id', registrationId);

    if (error) {
      alert(`Error approving registration: ${error.message}`);
    } else {
      setAllRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'Approved' } : r));
      alert("Registration approved.");
    }
  };

  const handleLeaderboardChange = (id: number, field: 'player_name' | 'winnings', value: string | number) => {
    setEditableLeaderboard(current =>
      current.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddLeaderboardEntry = () => {
    const newEntry: LeaderboardEntry = {
      id: Date.now(), // Temporary ID
      rank: editableLeaderboard.length + 1,
      player_name: 'New Player',
      winnings: 0,
      profile_pic_url: `https://picsum.photos/seed/new${Date.now()}/100`
    };
    setEditableLeaderboard(current => [...current, newEntry]);
  };

  const handleDeleteLeaderboardEntry = (id: number) => {
    setEditableLeaderboard(current => current.filter(entry => entry.id !== id));
  };
  
  const handleSaveLeaderboard = async () => {
    const sorted = [...editableLeaderboard].sort((a, b) => b.winnings - a.winnings);
    const ranked = sorted.map((entry, index) => ({ 
        ...entry, 
        rank: index + 1,
        // The id from DB should be kept. If it's a new entry, we'll let DB create it.
        id: entry.id > 1000000 ? undefined : entry.id 
    }));
    
    // Clear the table first
    const { error: deleteError } = await supabase.from('leaderboard').delete().neq('id', -1); // delete all
    if(deleteError) {
        alert("Error clearing leaderboard: " + deleteError.message);
        return;
    }
    
    // Insert new data
    const { data, error: insertError } = await supabase.from('leaderboard').insert(
        ranked.map(({id, ...rest}) => rest)
    ).select();
    
    if (insertError) {
        alert("Error saving leaderboard: " + insertError.message);
    } else {
        setLeaderboard(data || []);
        alert("Leaderboard saved successfully!");
    }
  };
  
  const handleSaveTournament = async (tournamentData: any) => {
    if (editingTournament) { // Edit
        const { data, error } = await supabase.from('tournaments').update(tournamentData).eq('id', editingTournament.id).select().single();
        if (error) alert(error.message);
        else setTournaments(ts => ts.map(t => t.id === data.id ? data : t));
    } else { // Add
        const { data, error } = await supabase.from('tournaments').insert(tournamentData).select().single();
        if (error) alert(error.message);
        else setTournaments(ts => [data, ...ts]);
    }
  };

  const pendingRegistrations = allRegistrations.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-yellow-400">Admin Dashboard</h1>

      {/* Notice Management */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Update Notice Banner</h2>
        <textarea
          value={newNotice}
          onChange={(e) => setNewNotice(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          rows={3}
        />
        <button onClick={handleUpdateNotice} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition">
          Update Notice
        </button>
      </div>
      
      {/* Tournament Management */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Manage Tournaments</h2>
            <button onClick={() => { setEditingTournament(null); setShowAddModal(true); }} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                Add Tournament
            </button>
        </div>
        <div className="space-y-2">
            {tournaments.map(t => (
                <div key={t.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-white">{t.name}</p>
                      <p className="text-xs text-gray-400">Room ID: {t.room_id || 'Not set'} | Pass: {t.room_password || 'Not set'}</p>
                    </div>
                    <button onClick={() => { setEditingTournament(t); setShowAddModal(true); }} className="text-sm text-yellow-400 hover:underline flex items-center space-x-1">
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                </div>
            ))}
        </div>
      </div>
      
      {/* Leaderboard Management */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Manage Leaderboard</h2>
        <div className="space-y-3">
          {editableLeaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-4 bg-gray-700 p-2 rounded-lg">
              <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>
              <input
                type="text"
                value={entry.player_name}
                onChange={(e) => handleLeaderboardChange(entry.id, 'player_name', e.target.value)}
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                placeholder="Player Name"
              />
              <input
                type="number"
                value={entry.winnings}
                onChange={(e) => handleLeaderboardChange(entry.id, 'winnings', Number(e.target.value))}
                className="w-32 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                placeholder="Winnings"
              />
              <button onClick={() => handleDeleteLeaderboardEntry(entry.id)} className="text-red-500 hover:text-red-400 p-1">
                  <XMarkIcon className="w-5 h-5"/>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4">
            <button onClick={handleAddLeaderboardEntry} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                Add Entry
            </button>
            <button onClick={handleSaveLeaderboard} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                Save Leaderboard
            </button>
        </div>
      </div>

      {/* Payment Approval */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Pending Approvals ({pendingRegistrations.length})</h2>
        {loading ? <p>Loading registrations...</p> : pendingRegistrations.length > 0 ? (
          <div className="space-y-4">
            {pendingRegistrations.map(reg => (
              <div key={reg.id} className="bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a href={reg.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img src={reg.payment_screenshot_url} alt="Payment screenshot" className="w-24 h-24 object-cover rounded-md border-2 border-gray-500 hover:border-red-500 transition-colors" />
                </a>
                <div className="flex-1">
                  <p className="font-bold text-white">{reg.playerName}</p>
                  <p className="text-sm text-gray-300">Game ID: <span className="font-mono">{reg.playerFreeFireId}</span></p>
                  <p className="text-sm text-gray-300">Tournament: {reg.tournamentName}</p>
                  <p className="text-sm text-gray-400">bKash No: <span className="font-mono">{reg.bkash_number}</span></p>
                  <p className="text-sm text-gray-400">TID ends with: <span className="font-mono">{reg.bkash_last4}</span></p>
                </div>
                <div className="flex-shrink-0 self-center sm:self-auto">
                  <button onClick={() => approveRegistration(reg.id)} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition w-full">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No pending approvals.</p>
        )}
      </div>
      {showAddModal && <TournamentModalForm onClose={() => setShowAddModal(false)} onSave={handleSaveTournament} tournament={editingTournament} />}
    </div>
  );
};

interface TournamentModalProps {
    onClose: () => void;
    onSave: (tournament: any) => void;
    tournament?: Tournament | null;
}

const TournamentModalForm: React.FC<TournamentModalProps> = ({ onClose, onSave, tournament }) => {
    const [name, setName] = useState(tournament?.name || '');
    const [date, setDate] = useState(tournament?.date || '');
    const [time, setTime] = useState(tournament?.time || '');
    const [entryFee, setEntryFee] = useState(tournament?.entry_fee || 0);
    const [prizePool, setPrizePool] = useState(tournament?.prize_pool || 0);
    const [status, setStatus] = useState<'Upcoming' | 'Ongoing' | 'Finished'>(tournament?.status as any || 'Upcoming');
    const [roomId, setRoomId] = useState(tournament?.room_id || '');
    const [roomPassword, setRoomPassword] = useState(tournament?.room_password || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tournamentData = { name, date, time, entry_fee: entryFee, prize_pool: prizePool, status, room_id: roomId, room_password: roomPassword };
        onSave(tournamentData);
        onClose();
    };

    const isEditing = !!tournament;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit' : 'Add New'} Tournament</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <input type="text" placeholder="Tournament Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Date (e.g., Aug 10, 2024)" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <input type="text" placeholder="Time (e.g., 8:00 PM)" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Entry Fee" value={entryFee} onChange={e => setEntryFee(Number(e.target.value))} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <input type="number" placeholder="Prize Pool" value={prizePool} onChange={e => setPrizePool(Number(e.target.value))} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Room ID (optional)" value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <input type="text" placeholder="Room Password (optional)" value={roomPassword} onChange={e => setRoomPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                     <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="Upcoming">Upcoming</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Finished">Finished</option>
                        </select>
                    </div>
                    <div className="p-4 bg-gray-900/50 border-t border-gray-700 -m-6 mt-6 pt-6">
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">{isEditing ? 'Save Changes' : 'Add Tournament'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AdminDashboard;
