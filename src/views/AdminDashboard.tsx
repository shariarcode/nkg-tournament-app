

import React, { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Registration, Tournament, LeaderboardEntry, SiteContentEntry, SiteContent } from '../types';
import { PencilIcon, XMarkIcon } from '../components/Icons';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';

type TournamentUpdate = Database['public']['Tables']['tournaments']['Update'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type RegistrationUpdate = Database['public']['Tables']['registrations']['Update'];
type LeaderboardInsert = Database['public']['Tables']['leaderboard']['Insert'];
type SiteContentInsert = Database['public']['Tables']['site_content']['Insert'];


type ContentSchemaItem = Omit<SiteContentEntry, 'id' | 'created_at' | 'value'> & { defaultValue: string };

const homeContentSchema: ContentSchemaItem[] = [
    { key: 'home_hero_subtitle', type: 'text', defaultValue: '# World Class eSports & Gaming Site' },
    { key: 'home_hero_title', type: 'textarea', defaultValue: 'SHAPING THE FUTURE OF <br/><span class="text-brand-green">ESPORTS</span>' },
    { key: 'home_features_banner_item1', type: 'text', defaultValue: 'GAMING SPANING' },
    { key: 'home_features_banner_item2', type: 'text', defaultValue: 'ACTION - PACKED' },
    { key: 'home_features_banner_item3', type: 'text', defaultValue: 'MIND - BENDING' },
    { key: 'home_features_banner_item4', type: 'text', defaultValue: 'COLLECTION OG GAMES' },
    { key: 'home_about_image', type: 'image_url', defaultValue: 'https://placehold.co/600x600/121415/96F01D?text=Bame' },
    { key: 'home_about_subtitle', type: 'text', defaultValue: '# About Our Gaming Site' },
    { key: 'home_about_title', type: 'text', defaultValue: 'Forging Legends In The Gaming Universe' },
    { key: 'home_about_p1', type: 'textarea', defaultValue: 'We are dedicated to creating a vibrant and competitive ecosystem for gamers of all levels. From grassroots tournaments to professional leagues, we provide the platform for players to showcase their skills, connect with the community, and forge their own legacy.' },
    { key: 'home_about_p2', type: 'textarea', defaultValue: 'Our state-of-the-art platform ensures fair play, seamless organization, and an electrifying experience for both participants and spectators.' },
    { key: 'home_games_subtitle', type: 'text', defaultValue: '# Releases The Latest Game' },
    { key: 'home_games_title', type: 'text', defaultValue: 'Game On, Power Up, Win Big!' },
];

const tournamentsContentSchema: ContentSchemaItem[] = [
    { key: 'tournaments_page_subtitle', type: 'text', defaultValue: '# Game Streaming Battle' },
    { key: 'tournaments_page_title', type: 'text', defaultValue: 'Our Gaming Tournaments!' },
];

const leaderboardContentSchema: ContentSchemaItem[] = [
    { key: 'leaderboard_page_subtitle', type: 'text', defaultValue: '# Top World Class Gamer' },
    { key: 'leaderboard_page_title', type: 'text', defaultValue: "Let's See Our Pro Players" },
];


const contentSchema = [...homeContentSchema, ...tournamentsContentSchema, ...leaderboardContentSchema];

const contentSchemasByPage = {
    'Home Page': homeContentSchema,
    'Tournaments Page': tournamentsContentSchema,
    'Leaderboard Page': leaderboardContentSchema,
} as const;

type ContentPageName = keyof typeof contentSchemasByPage;

const TournamentModalForm: React.FC<{
    onClose: () => void;
    onSave: (tournament: TournamentInsert | TournamentUpdate) => Promise<void>;
    tournament?: Tournament | null;
}> = ({ onClose, onSave, tournament }) => {
    const [name, setName] = useState(tournament?.name || '');
    const [date, setDate] = useState(tournament?.date || '');
    const [time, setTime] = useState(tournament?.time || '');
    const [entryFee, setEntryFee] = useState(tournament?.entry_fee || 0);
    const [prizePool, setPrizePool] = useState(tournament?.prize_pool || 0);
    const [status, setStatus] = useState<'Upcoming' | 'Ongoing' | 'Finished'>(tournament?.status as any || 'Upcoming');
    const [roomId, setRoomId] = useState(tournament?.room_id || '');
    const [roomPassword, setRoomPassword] = useState(tournament?.room_password || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const tournamentData = { 
            name, 
            date, 
            time, 
            entry_fee: entryFee, 
            prize_pool: prizePool, 
            status, 
            room_id: roomId || null, 
            room_password: roomPassword || null
        };
        
        try {
            await onSave(tournamentData);
            onClose();
        } catch (error) {
            console.error("Failed to save tournament", error);
            alert("Error: Could not save tournament.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isEditing = !!tournament;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-2 rounded-xl shadow-2xl w-full max-w-lg border border-white/10 animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit' : 'Add New'} Tournament</h2>
                    <button onClick={onClose} className="text-light-2 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <input type="text" placeholder="Tournament Name" value={name} onChange={e => setName(e.target.value)} required className="input-field" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Date (e.g., Aug 10, 2024)" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
                        <input type="text" placeholder="Time (e.g., 8:00 PM)" value={time} onChange={e => setTime(e.target.value)} required className="input-field" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Entry Fee" value={entryFee} onChange={e => setEntryFee(Number(e.target.value))} required className="input-field" />
                        <input type="number" placeholder="Prize Pool" value={prizePool} onChange={e => setPrizePool(Number(e.target.value))} required className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Room ID (optional)" value={roomId || ''} onChange={e => setRoomId(e.target.value)} className="input-field" />
                        <input type="text" placeholder="Room Password (optional)" value={roomPassword || ''} onChange={e => setRoomPassword(e.target.value)} className="input-field" />
                    </div>
                     <div>
                        <label className="text-light-2 text-sm font-sans">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input-field">
                            <option value="Upcoming">Upcoming</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Finished">Finished</option>
                        </select>
                    </div>
                    <div className="p-4 bg-dark-1/50 border-t border-white/20 -m-6 mt-6 pt-6">
                        <button type="submit" disabled={isSubmitting} className="w-full btn bg-brand-green text-dark-1 hover:bg-opacity-80 disabled:bg-gray-500 disabled:cursor-wait">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Tournament')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const { 
    tournaments,
    setTournaments, 
    leaderboard,
    setLeaderboard,
    setSiteContent
  } = useContext(AppContext) as AppContextType;

  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editableLeaderboard, setEditableLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);

  // State for site content management
  const [editableContent, setEditableContent] = useState<SiteContent>({});
  const [mergedContentSchema, setMergedContentSchema] = useState<(SiteContentEntry & { defaultValue: string })[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [activeContentTab, setActiveContentTab] = useState<ContentPageName>('Home Page');

  const fetchAdminData = async () => {
      setLoadingRegistrations(true);
      try {
          const regsPromise = supabase.from('registrations').select('*');
          const profilesPromise = supabase.from('profiles').select('id, name, free_fire_id');
          
          const [regsResult, profilesResult] = await Promise.all([regsPromise, profilesPromise]);

          if (regsResult.error) throw regsResult.error;
          if (profilesResult.error) throw profilesResult.error;
          
          const allRegs = regsResult.data || [];
          const allProfiles = profilesResult.data || [];
          const profilesMap = new Map(allProfiles.map(p => [p.id, { name: p.name, free_fire_id: p.free_fire_id }]));

          const formattedData: Registration[] = allRegs.map(r => {
              const profile = profilesMap.get(r.player_id);
              const tournament = tournaments.find(t => t.id === r.tournament_id);
              return {
                  ...r,
                  playerName: profile?.name || 'Unknown Player',
                  playerFreeFireId: profile?.free_fire_id || 'N/A',
                  tournamentName: tournament?.name || 'Unknown Tournament'
              };
          });
          setAllRegistrations(formattedData);
      } catch (error) {
          console.error("Error fetching registrations for admin:", error);
          alert("Could not fetch registrations.");
      } finally {
          setLoadingRegistrations(false);
      }
  };

  useEffect(() => {
    fetchAdminData();
    setEditableLeaderboard(JSON.parse(JSON.stringify(leaderboard)));
    
    // Fetch and merge site content for editing
    const fetchContentForAdmin = async () => {
        setLoadingContent(true);
        const { data, error } = await supabase.from('site_content').select('*');
        if (error) console.error("Error fetching site content for admin:", error);

        const dbContentMap = (data || []).reduce((acc, item) => {
            acc[item.key] = item;
            return acc;
        }, {} as Record<string, SiteContentEntry>);

        const mergedSchema = contentSchema.map((schemaItem) => {
            const dbItem = dbContentMap[schemaItem.key];
            return {
                id: dbItem?.id || 0,
                created_at: dbItem?.created_at || new Date().toISOString(),
                key: schemaItem.key,
                type: schemaItem.type,
                value: dbItem?.value ?? schemaItem.defaultValue,
                defaultValue: schemaItem.defaultValue
            };
        });
        setMergedContentSchema(mergedSchema);

        const contentMapForState = mergedSchema.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as SiteContent);

        setEditableContent(contentMapForState);
        setLoadingContent(false);
    };
    fetchContentForAdmin();

  }, [leaderboard, tournaments]);
  
  useEffect(() => {
      const channel = supabase
        .channel('public:registrations')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'registrations' },
          () => { fetchAdminData(); }
        )
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
  }, []);
  
  const approveRegistration = async (registrationId: number) => {
    const update: RegistrationUpdate = { status: 'Approved' };
    const { error } = await supabase.from('registrations').update(update).eq('id', registrationId);
    if (error) alert(`Error approving registration: ${error.message}`);
    else {
      setAllRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status: 'Approved' } : r));
      alert("Registration approved.");
    }
  };

  const handleLeaderboardChange = (id: number, field: keyof LeaderboardEntry, value: string | number) => {
    setEditableLeaderboard(current => current.map(entry => entry.id === id ? { ...entry, [field as keyof LeaderboardEntry]: value as never } : entry));
  };

  const handleAddLeaderboardEntry = () => {
    const newEntry: LeaderboardEntry = {
      id: Date.now(),
      rank: editableLeaderboard.length + 1,
      player_name: 'New Player',
      winnings: 0,
      profile_pic_url: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=new${Date.now()}`
    };
    setEditableLeaderboard(current => [...current, newEntry]);
  };

  const handleDeleteLeaderboardEntry = (id: number) => {
    setEditableLeaderboard(current => current.filter(entry => entry.id !== id));
  };
  
  const handleSaveLeaderboard = async () => {
    const sorted = [...editableLeaderboard].sort((a, b) => b.winnings - a.winnings);
    const ranked = sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
    
    const { error: deleteError } = await supabase.from('leaderboard').delete().neq('id', -1);
    if(deleteError) { alert("Error clearing leaderboard: " + deleteError.message); return; }
    
    const insertableData: LeaderboardInsert[] = ranked.map(({ id, ...rest }) => rest);
    const { data: insertedData, error: insertError } = await supabase.from('leaderboard').insert(insertableData).select();

    if (insertError) alert("Error saving leaderboard: " + insertError.message);
    else {
      setLeaderboard(insertedData as LeaderboardEntry[] || []);
      alert("Leaderboard saved successfully!");
    }
  };
  
  const handleSaveTournament = async (tournamentData: TournamentInsert | TournamentUpdate) => {
    if (editingTournament) { // Edit
        const { data, error } = await supabase.from('tournaments').update(tournamentData).eq('id', editingTournament.id).select().single();
        if (error) { alert(error.message); throw error; }
        else if (data) setTournaments(ts => ts.map(t => t.id === (data as Tournament).id ? (data as Tournament) : t));
    } else { // Add
        const { data, error } = await supabase.from('tournaments').insert(tournamentData as TournamentInsert).select().single();
        if (error) { alert(error.message); throw error; }
        else if (data) setTournaments(ts => [(data as Tournament), ...ts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleDeleteTournament = async (tournamentId: number) => {
    if (!window.confirm("Are you sure you want to delete this tournament? This action is permanent.")) return;
    try {
        const { error } = await supabase.from('tournaments').delete().eq('id', tournamentId);
        if (error) throw error;
        setTournaments(ts => ts.filter(t => t.id !== tournamentId));
        alert("Tournament deleted successfully.");
    } catch (error: any) {
        alert(`Failed to delete tournament: ${error.message}`);
    }
  };

  const pendingRegistrations = allRegistrations.filter(r => r.status === 'Pending');

  const handleContentChange = (key: string, value: string) => {
    setEditableContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveContent = async () => {
      const updates: SiteContentInsert[] = mergedContentSchema
          .map(entry => ({
              key: entry.key,
              value: editableContent[entry.key],
              type: entry.type
          }));

      if (updates.length === 0) {
          alert("No content to update.");
          return;
      }

      const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'key' });

      if (error) {
          alert("Error saving content: " + error.message);
      } else {
          setSiteContent(editableContent);
          const updatedSchema = mergedContentSchema.map(entry => ({
              ...entry,
              value: editableContent[entry.key]
          }));
          setMergedContentSchema(updatedSchema);
          alert("Site content saved successfully! The page will now use the new content.");
      }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-brand-yellow">Admin Dashboard</h1>
      
      {/* Site Content Management */}
      <div className="bg-dark-2 p-6 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Manage Site Content</h2>
             <button onClick={handleSaveContent} className="btn bg-brand-green text-dark-1 hover:bg-opacity-80">Save All Content</button>
        </div>
        
        <div className="flex border-b border-white/20 mb-4 font-sans">
            {(Object.keys(contentSchemasByPage) as ContentPageName[]).map(tabName => (
                <button 
                    key={tabName} 
                    onClick={() => setActiveContentTab(tabName)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200  ${activeContentTab === tabName ? 'border-b-2 border-brand-green text-brand-green' : 'text-light-2 hover:text-white'}`}
                >
                    {tabName}
                </button>
            ))}
        </div>

        {loadingContent ? <p className="text-light-2">Loading content editor...</p> : (
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                {contentSchemasByPage[activeContentTab].map(entry => (
                    <div key={entry.key} className={entry.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="text-sm font-sans text-light-2 capitalize">{entry.key.replace(/_/g, ' ')}</label>
                        {entry.type === 'textarea' ? (
                            <textarea
                                value={editableContent[entry.key] || ''}
                                onChange={(e) => handleContentChange(entry.key, e.target.value)}
                                className="input-field mt-1 h-24 w-full"
                                rows={4}
                            />
                        ) : (
                            <input
                                type="text"
                                value={editableContent[entry.key] || ''}
                                onChange={(e) => handleContentChange(entry.key, e.target.value)}
                                className="input-field mt-1 w-full"
                            />
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Tournament Management */}
      <div className="bg-dark-2 p-6 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Manage Tournaments</h2>
            <button onClick={() => { setEditingTournament(null); setShowAddModal(true); }} className="btn bg-brand-green text-dark-1 hover:bg-opacity-80">
                Add Tournament
            </button>
        </div>
        <div className="space-y-2">
            {tournaments.map(t => (
                <div key={t.id} className="bg-dark-3 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-white font-sans font-semibold">{t.name}</p>
                      <p className="text-xs text-light-2 font-sans">Room ID: {t.room_id || 'Not set'} | Pass: {t.room_password || 'Not set'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => { setEditingTournament(t); setShowAddModal(true); }} className="text-sm text-brand-yellow hover:underline flex items-center space-x-1">
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => handleDeleteTournament(t.id)} className="text-sm text-red-500 hover:text-red-400 flex items-center space-x-1">
                          <XMarkIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* Leaderboard Management */}
      <div className="bg-dark-2 p-6 rounded-lg border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-white">Manage Leaderboard</h2>
        <div className="space-y-3">
          {editableLeaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-4 bg-dark-3 p-2 rounded-lg">
              <span className="font-bold text-light-2 w-6 text-center">{index + 1}</span>
              <input type="text" value={entry.player_name} onChange={(e) => handleLeaderboardChange(entry.id, 'player_name', e.target.value)} className="flex-1 input-field !py-1" placeholder="Player Name" />
              <input type="number" value={entry.winnings} onChange={(e) => handleLeaderboardChange(entry.id, 'winnings', Number(e.target.value))} className="w-32 input-field !py-1" placeholder="Winnings" />
              <button onClick={() => handleDeleteLeaderboardEntry(entry.id)} className="text-red-500 hover:text-red-400 p-1"><XMarkIcon className="w-5 h-5"/></button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4">
            <button onClick={handleAddLeaderboardEntry} className="btn bg-blue-600 text-white hover:bg-blue-500">Add Entry</button>
            <button onClick={handleSaveLeaderboard} className="btn bg-brand-green text-dark-1 hover:bg-opacity-80">Save Leaderboard</button>
        </div>
      </div>

      {/* Payment Approval */}
      <div className="bg-dark-2 p-6 rounded-lg border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-white">Pending Approvals ({pendingRegistrations.length})</h2>
        {loadingRegistrations ? <p className="text-light-2">Loading registrations...</p> : 
         pendingRegistrations.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {pendingRegistrations.map(reg => (
              <div key={reg.id} className="bg-dark-3 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 font-sans">
                <a href={reg.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <img src={reg.payment_screenshot_url} alt="Payment screenshot" className="w-24 h-24 object-cover rounded-md border-2 border-white/20 hover:border-brand-green transition-colors" />
                </a>
                <div className="flex-1">
                  <p className="font-bold text-white">{reg.playerName}</p>
                  <p className="text-sm text-light-1">Game ID: <span className="font-mono">{reg.playerFreeFireId}</span></p>
                  <p className="text-sm text-light-2">Tournament: {reg.tournamentName}</p>
                  <p className="text-sm text-light-2">bKash No: <span className="font-mono">{reg.bkash_number}</span></p>
                  <p className="text-sm text-light-2">TID ends with: <span className="font-mono">{reg.bkash_last4}</span></p>
                </div>
                <div className="flex-shrink-0 self-center sm:self-auto">
                  <button onClick={() => approveRegistration(reg.id)} className="btn bg-brand-green text-dark-1 hover:bg-opacity-80 w-full">Approve</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-light-2">No pending approvals.</p>
        )}
      </div>
      {(showAddModal) && <TournamentModalForm onClose={() => { setShowAddModal(false); setEditingTournament(null); }} onSave={handleSaveTournament} tournament={editingTournament} /> }
    </div>
  );
};

export default AdminDashboard;