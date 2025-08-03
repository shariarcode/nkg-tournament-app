import React, { useContext, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Registration, Tournament, LeaderboardEntry, SiteContentEntry, SiteContent } from '../types';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';

type TournamentUpdate = Database['public']['Tables']['tournaments']['Update'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type RegistrationUpdate = Database['public']['Tables']['registrations']['Update'];
type SiteContentInsert = Database['public']['Tables']['site_content']['Insert'];

type AdminTab = 'registrations' | 'tournaments' | 'leaderboard' | 'content';
type ContentTab = 'site' | 'home' | 'tournaments' | 'leaderboard';

type ContentSchemaItem = Omit<SiteContentEntry, 'id' | 'created_at' | 'value'> & { defaultValue: string; label: string; };

// Schemas for editable content, now with labels for better UX in the admin panel.
const siteWideContentSchema: ContentSchemaItem[] = [
    { key: 'youtube_live_url', type: 'text', defaultValue: '', label: 'YouTube Live URL' },
    { key: 'facebook_live_url', type: 'text', defaultValue: '', label: 'Facebook Live URL' },
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
    const { siteContent, setSiteContent, tournaments, setTournaments } = useContext(AppContext) as AppContextType;
    const [activeTab, setActiveTab] = useState<AdminTab>('content');
    
    // State for content management
    const [activeContentTab, setActiveContentTab] = useState<ContentTab>('site');
    const [editableContent, setEditableContent] = useState<SiteContent>({});
    const [isContentSaving, setIsContentSaving] = useState(false);

    // State for all registrations
    const [allRegistrations, setAllRegistrations] =useState<Registration[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    
    useEffect(() => {
        setEditableContent(siteContent);
    }, [siteContent]);

     useEffect(() => {
        const fetchAllRegistrations = async () => {
            setLoadingRegistrations(true);
            const { data, error } = await supabase
                .from('registrations')
                .select(`
                    *,
                    profiles ( name, free_fire_id ),
                    tournaments ( name )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                alert('Could not fetch registrations.');
                console.error(error);
            } else if (data) {
                const formattedRegs = data.map((r: any) => ({
                    ...r,
                    playerName: r.profiles?.name || 'N/A',
                    playerFreeFireId: r.profiles?.free_fire_id || 'N/A',
                    tournamentName: r.tournaments?.name || 'N/A'
                }));
                setAllRegistrations(formattedRegs);
            }
            setLoadingRegistrations(false);
        };

        if (activeTab === 'registrations') {
            fetchAllRegistrations();
        }
    }, [activeTab]);


    const handleContentChange = (key: string, value: string) => {
        setEditableContent(prev => ({ ...prev, [key]: value }));
    };
    
    const handleContentSave = async () => {
        setIsContentSaving(true);
        const schemas = [...siteWideContentSchema, ...homeContentSchema, ...tournamentsContentSchema, ...leaderboardContentSchema];
        const updates: SiteContentInsert[] = Object.keys(editableContent).map(key => {
            const schemaItem = schemas.find(s => s.key === key);
            return {
                key,
                value: editableContent[key] || '',
                type: schemaItem?.type || 'text'
            };
        });
        
        try {
            const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'key' });
            if (error) throw error;
            
            setSiteContent(editableContent); // Update global context
            alert("Content saved successfully!");
        } catch (error: any) {
            console.error("Error saving content:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsContentSaving(false);
        }
    };
    
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

    const renderRegistrations = () => {
        if (loadingRegistrations) return <div className="text-center p-8">Loading registrations...</div>;
        return (
             <div className="space-y-4">
                <h2 className="text-2xl font-bold">Manage Registrations</h2>
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
                                        <button onClick={() => handleUpdateRegistrationStatus(reg.id, 'Approved')} className="text-xs bg-green-600 px-2 py-1 rounded">Approve</button>
                                        <button onClick={() => handleUpdateRegistrationStatus(reg.id, 'Rejected')} className="text-xs bg-red-600 px-2 py-1 rounded">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    
    const renderTournaments = () => <div className="text-center p-8 text-light-2">Tournament management coming soon.</div>;
    const renderLeaderboard = () => <div className="text-center p-8 text-light-2">Leaderboard management coming soon.</div>;

    const renderContentManagement = () => {
         const schemas: Record<ContentTab, {label: string, schema: ContentSchemaItem[]}> = {
             site: { label: 'Site-wide Settings', schema: siteWideContentSchema },
             home: { label: 'Home Page', schema: homeContentSchema },
             tournaments: { label: 'Tournaments Page', schema: tournamentsContentSchema },
             leaderboard: { label: 'Leaderboard Page', schema: leaderboardContentSchema },
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
                        <button key={key} onClick={() => setActiveContentTab(key as ContentTab)} className={`btn !px-4 !py-2 text-sm ${activeContentTab === key ? 'btn-primary' : 'bg-dark-3 text-light-1 hover:bg-dark-3/50'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {currentSchema.map(({ key, label, type, defaultValue }) => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-light-2 mb-1">{label}</label>
                            {type === 'textarea' ? (
                                <textarea
                                    id={key}
                                    value={editableContent[key] ?? defaultValue}
                                    onChange={e => handleContentChange(key, e.target.value)}
                                    className="input-field min-h-[100px] font-sans"
                                    rows={4}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id={key}
                                    value={editableContent[key] ?? defaultValue}
                                    onChange={e => handleContentChange(key, e.target.value)}
                                    className="input-field font-sans"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'registrations': return renderRegistrations();
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
                <button onClick={() => setActiveTab('tournaments')} className={`btn ${activeTab === 'tournaments' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Tournaments</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Leaderboard</button>
                <button onClick={() => setActiveTab('content')} className={`btn ${activeTab === 'content' ? 'btn-primary' : 'bg-dark-3 text-light-1'}`}>Content</button>
            </div>
            
            <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6 min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    )
};

export default AdminDashboard;