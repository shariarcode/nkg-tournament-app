

import React, { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Registration, Tournament, LeaderboardEntry, SiteContentEntry, SiteContent, Squad } from '../types';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';
import { XMarkIcon, PencilIcon, TrashIcon } from '../components/Icons';

type TournamentUpdate = Database['public']['Tables']['tournaments']['Update'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type LeaderboardUpdate = Database['public']['Tables']['leaderboard']['Update'];
type LeaderboardInsert = Database['public']['Tables']['leaderboard']['Insert'];
type SiteContentInsert = Database['public']['Tables']['site_content']['Insert'];

type AdminTab = 'registrations' | 'squadRegistrations' | 'tournaments' | 'leaderboard' | 'content';
type ContentTab = 'site' | 'home' | 'tournaments' | 'leaderboard';

type ContentSchemaItem = Omit<SiteContentEntry, 'id' | 'created_at' | 'value'> & { defaultValue: string; label: string; };

const getLiveUrls = (content: SiteContent, key: string, legacyKey: string): string[] => {
    const urlsJson = content[key];
    if (urlsJson) {
        try {
            const parsed = JSON.parse(urlsJson);
            if(Array.isArray(parsed)) return parsed.filter(u => typeof u === 'string');
        } catch {}
    }
    const legacyUrl = content[legacyKey];
    if (legacyUrl && typeof legacyUrl === 'string' && legacyUrl.trim() !== '') {
        return [legacyUrl];
    }
    return [];
}

// Schemas for dynamic content form
const siteWideContentSchema: ContentSchemaItem[] = [
    { key: 'youtube_live_urls', type: 'textarea', defaultValue: '[]', label: 'YouTube Live URLs' },
    { key: 'facebook_live_urls', type: 'textarea', defaultValue: '[]', label: 'Facebook Live URLs' },
];

const homeContentSchema: ContentSchemaItem[] = [
    { key: 'home_hero_subtitle', type: 'text', defaultValue: '# World Class eSports & Gaming Site', label: 'Hero Subtitle' },
    { key: 'home_hero_title', type: 'textarea', defaultValue: 'SHAPING THE FUTURE OF <br/><span class="text-brand-green">ESPORTS</span>', label: 'Hero Title (HTML allowed)' },
    { key: 'home_features_banner_item1', type: 'text', defaultValue: 'GAMING SPANING', label: 'Feature Banner 1' },
    { key: 'home_features_banner_item2', type: 'text', defaultValue: 'ACTION - PACKED', label: 'Feature Banner 2' },
    { key: 'home_features_banner_item3', type: 'text', defaultValue: 'MIND - BENDING', label: 'Feature Banner 3' },
    { key: 'home_features_banner_item4', type: 'text', defaultValue: 'COLLECTION OG GAMES', label: 'Feature Banner 4' },
    { key: 'home_about_image', type: 'text', defaultValue: 'https://placehold.co/600x600/121415/96F01D?text=Bame', label: 'About Section Image URL' },
    { key: 'home_about_subtitle', type: 'text', defaultValue: '# About Our Gaming Site', label: 'About Subtitle' },
    { key: 'home_about_title', type: 'text', defaultValue: 'Forging Legends In The Gaming Universe', label: 'About Title' },
    { key: 'home_about_p1', type: 'textarea', defaultValue: 'We are dedicated to creating a vibrant and competitive ecosystem for gamers of all levels...', label: 'About Paragraph 1' },
    { key: 'home_about_p2', type: 'textarea', defaultValue: 'Our state-of-the-art platform ensures fair play...', label: 'About Paragraph 2' },
    { key: 'home_games_subtitle', type: 'text', defaultValue: '# Releases The Latest Game', label: 'Games Subtitle' },
    { key: 'home_games_title', type: 'text', defaultValue: 'Game On, Power Up, Win Big!', label: 'Games Title' },
];
const tournamentsContentSchema: ContentSchemaItem[] = [
    { key: 'tournaments_page_subtitle', type: 'text', defaultValue: '# Game Streaming Battle', label: 'Page Subtitle' },
    { key: 'tournaments_page_title', type: 'text', defaultValue: 'Our Gaming Tournaments!', label: 'Page Title' },
];
const leaderboardContentSchema: ContentSchemaItem[] = [
    { key: 'leaderboard_page_subtitle', type: 'text', defaultValue: '# Top World Class Gamer', label: 'Page Subtitle' },
    { key: 'leaderboard_page_title', type: 'text', defaultValue: "Let's See Our Pro Players", label: 'Page Title' },
];


const AdminDashboard: React.FC = () => {
    const { siteContent, setSiteContent, tournaments, setTournaments, leaderboard, setLeaderboard } = useContext(AppContext) as AppContextType;
    const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');
    
    // State for all registrations
    const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    
    // State for squad registrations
    const [allSquads, setAllSquads] = useState<Squad[]>([]);
    const [loadingSquads, setLoadingSquads] = useState(false);

    // State for content management
    const [activeContentTab, setActiveContentTab] = useState<ContentTab>('site');
    const [editableContent, setEditableContent] = useState<SiteContent>({});
    const [isContentSaving, setIsContentSaving] = useState(false);
    
    // State for modals and editing
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | Partial<Tournament> | null>(null);
    const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
    const [selectedLeaderboardEntry, setSelectedLeaderboardEntry] = useState<LeaderboardEntry | Partial<LeaderboardEntry> | null>(null);

    
    useEffect(() => {
        setEditableContent(siteContent);
    }, [siteContent]);

    useEffect(() => {
        const fetchAllRegistrations = async () => {
            setLoadingRegistrations(true);
            try {
                const regPromise = supabase.from('registrations').select('*').order('created_at', { ascending: false });
                const profilePromise = supabase.from('profiles').select('id, name, free_fire_id');

                const [regResult, profileResult] = await Promise.all([regPromise, profilePromise]);

                const { data: regData, error: regError } = regResult;
                const { data: profileData, error: profileError } = profileResult;

                if (regError || profileError) {
                    throw regError || profileError;
                }
                
                if (regData && profileData) {
                    const profileMap = new Map(profileData.map(p => [p.id, p]));
                    const tournamentMap = new Map(tournaments.map(t => [t.id, t]));

                    const formattedRegs: Registration[] = regData.map(r => ({
                        ...r,
                        playerName: profileMap.get(r.player_id)?.name || 'N/A',
                        playerFreeFireId: profileMap.get(r.player_id)?.free_fire_id || 'N/A',
                        tournamentName: tournamentMap.get(r.tournament_id)?.name || 'N/A'
                    }));
                    setAllRegistrations(formattedRegs);
                }
            } catch (error: any) {
                alert('Could not fetch registrations.');
                console.error(error.message || error);
            } finally {
                setLoadingRegistrations(false);
            }
        };

        const fetchAllSquads = async () => {
            setLoadingSquads(true);
            try {
                const { data, error } = await supabase
                    .from('squads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                setAllSquads(data || []);
            } catch (error: any) {
                 alert('Could not fetch squad registrations.');
                 console.error(error.message || error);
            } finally {
                setLoadingSquads(false);
            }
        };

        if (activeTab === 'registrations') {
            fetchAllRegistrations();
        }
        if (activeTab === 'squadRegistrations') {
            fetchAllSquads();
        }
    }, [activeTab, tournaments]);


    const handleUpdateRegistrationStatus = async (regId: number, newStatus: Registration['status']) => {
        const { error } = await supabase
            .from('registrations')
            .update({ status: newStatus })
            .eq('id', regId);
        if (error) {
            alert(`Error updating status: ${error.message}`);
        } else {
            setAllRegistrations(regs => regs.map(r => r.id === regId ? {...r, status: newStatus} : r));
            alert("Registration status updated.");
        }
    };
    
    const handleUpdateSquadStatus = async (squadId: number, newStatus: Squad['status']) => {
        const { error } = await supabase
            .from('squads')
            .update({ status: newStatus })
            .eq('id', squadId);
        if (error) {
            alert(`Error updating squad status: ${error.message}`);
        } else {
            setAllSquads(squads => squads.map(s => s.id === squadId ? { ...s, status: newStatus } : s));
            alert("Squad registration status updated.");
        }
    };
    
    // --- Tournament Management ---
    const handleOpenTournamentModal = (tournament: Tournament | null) => {
        setSelectedTournament(tournament ? {...tournament} : {
            name: '', date: '', time: '', prize_pool: 0, entry_fee: 0, status: 'Upcoming', total_spots: 48
        });
        setTournamentModalOpen(true);
    };

    const handleDeleteTournament = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this tournament? This cannot be undone.')) {
            const { error } = await supabase.from('tournaments').delete().eq('id', id);
            if (error) {
                alert(`Error deleting tournament: ${error.message}`);
            } else {
                setTournaments(prev => prev.filter(t => t.id !== id));
                alert('Tournament deleted.');
            }
        }
    };

    const handleSaveTournament = async (formData: TournamentUpdate | TournamentInsert) => {
        setIsSubmitting(true);
        const isUpdate = 'id' in formData && formData.id;

        try {
            if (isUpdate) {
                const { data, error } = await supabase.from('tournaments').update(formData).eq('id', formData.id!).select().single();
                if (error) throw error;
                if(data) setTournaments(prev => prev.map(t => t.id === data.id ? data : t));
                alert('Tournament updated successfully.');
            } else {
                const { data, error } = await supabase.from('tournaments').insert(formData).select().single();
                if (error) throw error;
                if (data) setTournaments(prev => [data, ...prev]);
                alert('Tournament created successfully.');
            }
            setTournamentModalOpen(false);
        } catch (error: any) {
            alert(`Error saving tournament: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Leaderboard Management ---
    const handleOpenLeaderboardModal = (entry: LeaderboardEntry | null) => {
        setSelectedLeaderboardEntry(entry ? {...entry} : { player_name: '', winnings: 0, rank: 0, profile_pic_url: ''});
        setLeaderboardModalOpen(true);
    };

    const handleDeleteLeaderboardEntry = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this leaderboard entry?')) {
            const { error } = await supabase.from('leaderboard').delete().eq('id', id);
            if (error) {
                alert(`Error deleting entry: ${error.message}`);
            } else {
                setLeaderboard(prev => prev.filter(e => e.id !== id));
                alert('Leaderboard entry deleted.');
            }
        }
    };
    
    const handleSaveLeaderboardEntry = async (formData: LeaderboardUpdate | LeaderboardInsert) => {
        setIsSubmitting(true);
        const isUpdate = 'id' in formData && formData.id;

        try {
            if (isUpdate) {
                const { data, error } = await supabase.from('leaderboard').update(formData).eq('id', formData.id!).select().single();
                if (error) throw error;
                if(data) setLeaderboard(prev => prev.map(e => e.id === data.id ? data : e).sort((a,b) => (a.rank || 0) - (b.rank || 0)));
                alert('Leaderboard entry updated.');
            } else {
                const { data, error } = await supabase.from('leaderboard').insert(formData).select().single();
                if (error) throw error;
                if (data) setLeaderboard(prev => [...prev, data].sort((a, b) => (a.rank || 0) - (b.rank || 0)));
                alert('Leaderboard entry added.');
            }
            setLeaderboardModalOpen(false);
        } catch (error: any) {
            alert(`Error saving entry: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- Content Management ---
    const handleContentChange = (key: string, value: string) => {
        setEditableContent(prev => ({ ...prev, [key]: value }));
    };
    
    const handleContentSave = async () => {
        setIsContentSaving(true);
        const contentToUpdate = { ...editableContent };
    
        const finalYoutubeUrls = getLiveUrls(contentToUpdate, 'youtube_live_urls', 'youtube_live_url');
        contentToUpdate['youtube_live_urls'] = JSON.stringify(finalYoutubeUrls.filter(u => u.trim() !== ''));
        delete contentToUpdate['youtube_live_url'];
    
        const finalFacebookUrls = getLiveUrls(contentToUpdate, 'facebook_live_urls', 'facebook_live_url');
        contentToUpdate['facebook_live_urls'] = JSON.stringify(finalFacebookUrls.filter(u => u.trim() !== ''));
        delete contentToUpdate['facebook_live_url'];

        const schemas = [...siteWideContentSchema, ...homeContentSchema, ...tournamentsContentSchema, ...leaderboardContentSchema];
        const upsertData: SiteContentInsert[] = Object.keys(contentToUpdate)
          .filter(key => schemas.some(s => s.key === key))
          .map(key => {
            const schemaItem = schemas.find(s => s.key === key)!;
            return { key, value: contentToUpdate[key] || '', type: schemaItem.type };
        });
        
        try {
            const { error: upsertError } = await supabase.from('site_content').upsert(upsertData, { onConflict: 'key' });
            if (upsertError) throw upsertError;
            
            const { error: deleteError } = await supabase.from('site_content').delete().in('key', ['youtube_live_url', 'facebook_live_url']);
            if (deleteError) console.error("Could not delete legacy keys:", deleteError.message);
            
            setSiteContent(contentToUpdate);
            alert("Content saved successfully!");
        } catch (error: any) {
            console.error("Error saving content:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsContentSaving(false);
        }
    };
    
    // --- Render Functions ---
    const renderRegistrations = () => {
        if (loadingRegistrations) return <div className="text-center p-8">Loading registrations...</div>;
        return (
             <div className="space-y-4">
                <h2 className="text-2xl font-bold">Manage Solo/Tournament Registrations</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="border-b-2 border-white/10 text-sm text-light-2 uppercase">
                            <tr>
                                <th className="p-3">Player</th>
                                <th className="p-3">Tournament</th>
                                <th className="p-3">bKash Info</th>
                                <th className="p-3">Screenshot</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allRegistrations.map(reg => (
                                <tr key={reg.id} className="border-b border-white/10 last:border-0 hover:bg-dark-3/50">
                                    <td className="p-3 text-light-1">{reg.playerName} ({reg.playerFreeFireId})</td>
                                    <td className="p-3 text-light-2">{reg.tournamentName}</td>
                                    <td className="p-3 text-light-2">{reg.bkash_number} ({reg.bkash_last4})</td>
                                    <td className="p-3"><a href={reg.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">View</a></td>
                                    <td className="p-3 text-center">
                                         <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            reg.status === 'Pending' ? 'bg-brand-yellow text-dark-1' :
                                            reg.status === 'Approved' ? 'bg-brand-green text-dark-1' :
                                            'bg-red-800 text-white'
                                          }`}>
                                            {reg.status}
                                          </span>
                                    </td>
                                    <td className="p-3 text-center space-x-2">
                                        <button onClick={() => handleUpdateRegistrationStatus(reg.id, 'Approved')} className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">Approve</button>
                                        <button onClick={() => handleUpdateRegistrationStatus(reg.id, 'Rejected')} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded">Reject</button>
                                    </td>
                                </tr>
                            ))}
                             {allRegistrations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-light-2">No solo registrations found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderSquadRegistrations = () => {
        if (loadingSquads) return <div className="text-center p-8">Loading squad registrations...</div>;
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Manage Squad Registrations</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="border-b-2 border-white/10 text-sm text-light-2 uppercase">
                            <tr>
                                <th className="p-3">Squad Name</th>
                                <th className="p-3">Captain</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3">bKash Info</th>
                                <th className="p-3">Screenshot</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allSquads.map(squad => (
                                <tr key={squad.id} className="border-b border-white/10 last:border-0 hover:bg-dark-3/50">
                                    <td className="p-3 text-light-1 font-semibold">{squad.squad_name}</td>
                                    <td className="p-3 text-light-2">{squad.captain_name}</td>
                                    <td className="p-3 text-light-2 text-xs">{squad.whatsapp_number}<br />{squad.contact_email}</td>
                                    <td className="p-3 text-light-2">{squad.bkash_number} ({squad.bkash_last4})</td>
                                    <td className="p-3"><a href={squad.payment_screenshot_url || '#'} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">View</a></td>
                                    <td className="p-3 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            squad.status === 'Pending' ? 'bg-brand-yellow text-dark-1' :
                                            squad.status === 'Approved' ? 'bg-brand-green text-dark-1' :
                                            'bg-red-800 text-white'
                                        }`}>
                                            {squad.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center space-x-2">
                                        <button onClick={() => handleUpdateSquadStatus(squad.id, 'Approved')} className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">Approve</button>
                                        <button onClick={() => handleUpdateSquadStatus(squad.id, 'Rejected')} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded">Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {allSquads.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-light-2">No squad registrations found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const renderTournaments = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Tournaments</h2>
                <button onClick={() => handleOpenTournamentModal(null)} className="btn btn-primary">Create New</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                    <thead className="border-b-2 border-white/10 text-sm text-light-2 uppercase">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Prize Pool</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map(t => (
                            <tr key={t.id} className="border-b border-white/10 last:border-0 hover:bg-dark-3/50">
                                <td className="p-3 font-semibold">{t.name}</td>
                                <td className="p-3 text-light-2">{t.date}</td>
                                <td className="p-3 text-light-2">৳{t.prize_pool}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        t.status === 'Upcoming' ? 'bg-blue-600 text-white' : 
                                        t.status === 'Ongoing' ? 'bg-yellow-500 text-black' : 
                                        'bg-gray-600 text-gray-200'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button onClick={() => handleOpenTournamentModal(t)} className="p-2 hover:bg-white/10 rounded-full"><PencilIcon className="w-4 h-4 text-light-2"/></button>
                                    <button onClick={() => handleDeleteTournament(t.id)} className="p-2 hover:bg-white/10 rounded-full"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderLeaderboard = () => (
         <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Leaderboard</h2>
                <button onClick={() => handleOpenLeaderboardModal(null)} className="btn btn-primary">Add New Entry</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                    <thead className="border-b-2 border-white/10 text-sm text-light-2 uppercase">
                        <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Player</th>
                            <th className="p-3">Winnings</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map(entry => (
                            <tr key={entry.id} className="border-b border-white/10 last:border-0 hover:bg-dark-3/50">
                                <td className="p-3 font-bold text-xl">{entry.rank}</td>
                                <td className="p-3 font-semibold">{entry.player_name}</td>
                                <td className="p-3 text-light-2">৳{entry.winnings}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button onClick={() => handleOpenLeaderboardModal(entry)} className="p-2 hover:bg-white/10 rounded-full"><PencilIcon className="w-4 h-4 text-light-2"/></button>
                                    <button onClick={() => handleDeleteLeaderboardEntry(entry.id)} className="p-2 hover:bg-white/10 rounded-full"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContentManagement = () => {
        const schemas: Record<ContentTab, {label: string, schema: ContentSchemaItem[]}> = {
            site: { label: 'Site-wide Settings', schema: siteWideContentSchema },
            home: { label: 'Home Page', schema: homeContentSchema },
            tournaments: { label: 'Tournaments Page', schema: tournamentsContentSchema },
            leaderboard: { label: 'Leaderboard Page', schema: leaderboardContentSchema },
        };

       const renderUrlManager = (label: string, contentKey: 'youtube_live_urls' | 'facebook_live_urls', legacyKey: 'youtube_live_url' | 'facebook_live_url') => {
            const urls = getLiveUrls(editableContent, contentKey, legacyKey);
            const handleUrlChange = (index: number, value: string) => {
                const newUrls = [...urls]; newUrls[index] = value;
                handleContentChange(contentKey, JSON.stringify(newUrls));
            };
            const addUrl = () => {
                const newUrls = [...urls, ''];
                handleContentChange(contentKey, JSON.stringify(newUrls));
            };
            const removeUrl = (index: number) => {
                const newUrls = urls.filter((_, i) => i !== index);
                handleContentChange(contentKey, JSON.stringify(newUrls));
            };
            return (
                <div key={contentKey}>
                    <label className="block text-sm font-medium text-light-2 mb-2">{label}</label>
                    <div className="space-y-2">
                        {urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={url} onChange={e => handleUrlChange(index, e.target.value)} className="input-field font-sans flex-grow" placeholder="Enter full live stream URL..."/>
                                <button onClick={() => removeUrl(index)} className="btn !p-2.5 bg-red-800 text-white hover:bg-red-700 rounded-lg"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                         {urls.length === 0 && <p className="text-sm text-light-2/70 font-sans p-2">No URLs added.</p>}
                    </div>
                    <button onClick={addUrl} className="btn !py-2 !px-4 text-sm bg-dark-3 hover:bg-white/10 mt-2 rounded-lg">Add URL</button>
                </div>
            );
        };
        const currentSchema = schemas[activeContentTab].schema;
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl font-bold">Content Management</h2>
                    <button onClick={handleContentSave} className="btn btn-primary" disabled={isContentSaving}>
                        {isContentSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 border-b-2 border-white/10 pb-2">
                    {Object.entries(schemas).map(([key, {label}]) => (
                        <button key={key} onClick={() => setActiveContentTab(key as ContentTab)} className={`btn !px-4 !py-2 text-sm ${activeContentTab === key ? 'btn-primary' : 'bg-dark-3 text-light-1 hover:bg-dark-3/50'}`}>{label}</button>
                    ))}
                </div>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {currentSchema.map(({ key, label, type, defaultValue }) => {
                        if (key === 'youtube_live_urls') return renderUrlManager(label, 'youtube_live_urls', 'youtube_live_url');
                        if (key === 'facebook_live_urls') return renderUrlManager(label, 'facebook_live_urls', 'facebook_live_url');
                        return (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-light-2 mb-1">{label}</label>
                                {type === 'textarea' ? (
                                    <textarea id={key} value={editableContent[key] ?? defaultValue} onChange={e => handleContentChange(key, e.target.value)} className="input-field min-h-[100px] font-sans" rows={4}/>
                                ) : (
                                    <input type="text" id={key} value={editableContent[key] ?? defaultValue} onChange={e => handleContentChange(key, e.target.value)} className="input-field font-sans"/>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'registrations': return renderRegistrations();
            case 'squadRegistrations': return renderSquadRegistrations();
            case 'tournaments': return renderTournaments();
            case 'leaderboard': return renderLeaderboard();
            case 'content': return renderContentManagement();
            default: return null;
        }
    };
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <div className="flex flex-wrap gap-2 border-b-2 border-white/10 pb-4">
                <button onClick={() => setActiveTab('registrations')} className={`btn ${activeTab === 'registrations' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Registrations</button>
                <button onClick={() => setActiveTab('squadRegistrations')} className={`btn ${activeTab === 'squadRegistrations' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Squad Registrations</button>
                <button onClick={() => setActiveTab('tournaments')} className={`btn ${activeTab === 'tournaments' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Tournaments</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Leaderboard</button>
                <button onClick={() => setActiveTab('content')} className={`btn ${activeTab === 'content' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Content</button>
            </div>
            
            <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6 min-h-[400px]">
                {renderTabContent()}
            </div>
            
            {tournamentModalOpen && <TournamentModal tournament={selectedTournament as any} onSave={handleSaveTournament} onClose={() => setTournamentModalOpen(false)} isSubmitting={isSubmitting}/>}
            {leaderboardModalOpen && <LeaderboardModal entry={selectedLeaderboardEntry as any} onSave={handleSaveLeaderboardEntry} onClose={() => setLeaderboardModalOpen(false)} isSubmitting={isSubmitting}/>}
        </div>
    )
};


// Modal Components live within the AdminDashboard file
const TournamentModal: React.FC<{tournament: Tournament | Partial<Tournament>, onSave: Function, onClose: Function, isSubmitting: boolean}> = ({ tournament, onSave, onClose, isSubmitting }) => {
    const [formData, setFormData] = useState(tournament);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: ['prize_pool', 'entry_fee', 'per_kill_prize', 'total_spots', 'spots_filled'].includes(name) ? parseInt(value) || 0 : value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-2 rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold text-white">{'id' in formData ? 'Edit' : 'Create'} Tournament</h2>
                    <button onClick={() => onClose()} className="text-light-2 hover:text-white"><XMarkIcon className="h-7 w-7" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="input-field md:col-span-2" required/>
                        <input name="date" value={formData.date} onChange={handleChange} placeholder="Date (e.g., July 30, 2024)" className="input-field" required/>
                        <input name="time" value={formData.time} onChange={handleChange} placeholder="Time (e.g., 8:00 PM)" className="input-field" required/>
                        <input name="prize_pool" type="number" value={formData.prize_pool} onChange={handleChange} placeholder="Prize Pool" className="input-field" required/>
                        <input name="entry_fee" type="number" value={formData.entry_fee} onChange={handleChange} placeholder="Entry Fee" className="input-field" required/>
                        <select name="status" value={formData.status} onChange={handleChange} className="input-field" required>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Finished">Finished</option>
                        </select>
                        <input name="map" value={formData.map || ''} onChange={handleChange} placeholder="Map" className="input-field"/>
                        <input name="type" value={formData.type || ''} onChange={handleChange} placeholder="Type (e.g., Squad)" className="input-field"/>
                        <input name="version" value={formData.version || ''} onChange={handleChange} placeholder="Version (e.g., TPP)" className="input-field"/>
                        <input name="per_kill_prize" type="number" value={formData.per_kill_prize || 0} onChange={handleChange} placeholder="Per Kill Prize" className="input-field"/>
                        <input name="total_spots" type="number" value={formData.total_spots || 0} onChange={handleChange} placeholder="Total Spots" className="input-field"/>
                        <input name="banner_image_url" value={formData.banner_image_url || ''} onChange={handleChange} placeholder="Banner Image URL" className="input-field md:col-span-2"/>
                    </div>
                    <div className="p-4 bg-dark-1/50 border-t border-white/20 flex justify-end gap-4">
                        <button type="button" onClick={() => onClose()} className="btn bg-dark-3 text-light-1">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LeaderboardModal: React.FC<{entry: LeaderboardEntry | Partial<LeaderboardEntry>, onSave: Function, onClose: Function, isSubmitting: boolean}> = ({ entry, onSave, onClose, isSubmitting }) => {
    const [formData, setFormData] = useState(entry);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: ['winnings', 'rank'].includes(name) ? parseInt(value) || 0 : value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-2 rounded-xl shadow-2xl w-full max-w-md border border-white/10 animate-fade-in-up">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h2 className="text-2xl font-bold text-white">{'id' in formData ? 'Edit' : 'Add'} Leaderboard Entry</h2>
                    <button onClick={() => onClose()} className="text-light-2 hover:text-white"><XMarkIcon className="h-7 w-7" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div className="p-6 space-y-4">
                        <input name="player_name" value={formData.player_name} onChange={handleChange} placeholder="Player Name" className="input-field" required/>
                        <input name="rank" type="number" value={formData.rank || ''} onChange={handleChange} placeholder="Rank" className="input-field" required/>
                        <input name="winnings" type="number" value={formData.winnings} onChange={handleChange} placeholder="Winnings" className="input-field" required/>
                        <input name="profile_pic_url" value={formData.profile_pic_url || ''} onChange={handleChange} placeholder="Profile Picture URL" className="input-field"/>
                    </div>
                    <div className="p-4 bg-dark-1/50 border-t border-white/20 flex justify-end gap-4">
                        <button type="button" onClick={() => onClose()} className="btn bg-dark-3 text-light-1">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AdminDashboard;