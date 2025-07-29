
import React, { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Registration, Tournament, LeaderboardEntry } from '../types';
import { PencilIcon, XMarkIcon } from '../components/Icons';

const AdminDashboard: React.FC = () => {
  const { 
    notice, 
    setNotice, 
    registrations, 
    approveRegistration, 
    tournaments, 
    addTournament,
    editTournament,
    leaderboard,
    setLeaderboard
  } = useContext(AppContext) as AppContextType;

  const [newNotice, setNewNotice] = useState(notice);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // --- Leaderboard State ---
  const [editableLeaderboard, setEditableLeaderboard] = useState<LeaderboardEntry[]>(leaderboard);
  useEffect(() => {
    setEditableLeaderboard(leaderboard);
  }, [leaderboard]);

  const handleUpdateNotice = () => {
    setNotice(newNotice);
    alert("Notice updated!");
  };

  const handleLeaderboardChange = (id: string, field: 'playerName' | 'winnings', value: string | number) => {
    setEditableLeaderboard(current =>
      current.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddLeaderboardEntry = () => {
    const newEntry: LeaderboardEntry = {
      id: `lb_${Date.now()}`,
      rank: editableLeaderboard.length + 1,
      playerName: 'New Player',
      winnings: 0,
      profilePicUrl: `https://picsum.photos/seed/new${Date.now()}/100`
    };
    setEditableLeaderboard(current => [...current, newEntry]);
  };

  const handleDeleteLeaderboardEntry = (id: string) => {
    setEditableLeaderboard(current => current.filter(entry => entry.id !== id));
  };
  
  const handleSaveLeaderboard = () => {
    const sorted = [...editableLeaderboard].sort((a, b) => b.winnings - a.winnings);
    const ranked = sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
    setLeaderboard(ranked);
    alert("Leaderboard saved successfully!");
  };

  const pendingRegistrations = registrations.filter(r => r.status === 'Pending');

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
            <button onClick={() => setShowAddModal(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                Add Tournament
            </button>
        </div>
        <div className="space-y-2">
            {tournaments.map(t => (
                <div key={t.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-white">{t.name}</p>
                      <p className="text-xs text-gray-400">Room ID: {t.roomId || 'Not set'} | Pass: {t.roomPassword || 'Not set'}</p>
                    </div>
                    <button onClick={() => setEditingTournament(t)} className="text-sm text-yellow-400 hover:underline flex items-center space-x-1">
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
                value={entry.playerName}
                onChange={(e) => handleLeaderboardChange(entry.id, 'playerName', e.target.value)}
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
        {pendingRegistrations.length > 0 ? (
          <div className="space-y-4">
            {pendingRegistrations.map(reg => (
              <div key={reg.id} className="bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a href={reg.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img src={reg.paymentScreenshotUrl} alt="Payment screenshot" className="w-24 h-24 object-cover rounded-md border-2 border-gray-500 hover:border-red-500 transition-colors" />
                </a>
                <div className="flex-1">
                  <p className="font-bold text-white">{reg.playerName}</p>
                  <p className="text-sm text-gray-300">Game ID: <span className="font-mono">{reg.playerFreeFireId}</span></p>
                  <p className="text-sm text-gray-300">Tournament: {reg.tournamentName}</p>
                  <p className="text-sm text-gray-400">bKash No: <span className="font-mono">{reg.bkashNumber}</span></p>
                  <p className="text-sm text-gray-400">TID ends with: <span className="font-mono">{reg.bkashLast4}</span></p>
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
      {showAddModal && <AddTournamentModal onClose={() => setShowAddModal(false)} onSave={addTournament} />}
      {editingTournament && <EditTournamentModal tournament={editingTournament} onClose={() => setEditingTournament(null)} onSave={editTournament} />}
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
    const [entryFee, setEntryFee] = useState(tournament?.entryFee || 0);
    const [prizePool, setPrizePool] = useState(tournament?.prizePool || 0);
    const [status, setStatus] = useState<'Upcoming' | 'Ongoing' | 'Finished'>(tournament?.status || 'Upcoming');
    const [roomId, setRoomId] = useState(tournament?.roomId || '');
    const [roomPassword, setRoomPassword] = useState(tournament?.roomPassword || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tournamentData = { name, date, time, entryFee, prizePool, status, roomId, roomPassword };
        if (tournament) {
            onSave({ ...tournament, ...tournamentData });
        } else {
            onSave(tournamentData);
        }
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

const AddTournamentModal: React.FC<{onClose: () => void, onSave: (t: Omit<Tournament, 'id'>) => void}> = ({onClose, onSave}) => (
    <TournamentModalForm onClose={onClose} onSave={onSave} />
);

const EditTournamentModal: React.FC<{onClose: () => void, onSave: (t: Tournament) => void, tournament: Tournament}> = ({onClose, onSave, tournament}) => (
    <TournamentModalForm onClose={onClose} onSave={onSave} tournament={tournament} />
);

export default AdminDashboard;