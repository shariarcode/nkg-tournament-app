import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { ArrowUpTrayIcon } from '../components/Icons';
import { supabase } from '../services/supabase';
import { Squad, Tournament } from '../types';
import type { Database } from '../services/database.types';

type SquadInsert = Database['public']['Tables']['squads']['Insert'];

// New interface for combined data
interface UserSquad extends Squad {
    tournament?: Tournament;
}

const SquadRegistration: React.FC = () => {
    const { player, tournaments: allTournaments } = useContext(AppContext) as AppContextType;

    // Form State
    const [squadName, setSquadName] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [player3Name, setPlayer3Name] = useState('');
    const [player4Name, setPlayer4Name] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState(player.phone || '');
    const [contactEmail, setContactEmail] = useState(player.email || '');
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');

    // Payment State
    const [bkashNumber, setBkashNumber] = useState('');
    const [bkashLast4, setBkashLast4] = useState('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string>('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State
    const [userSquads, setUserSquads] = useState<UserSquad[]>([]);
    const [loadingUserSquads, setLoadingUserSquads] = useState(true);
    const [recentSquads, setRecentSquads] = useState<Squad[]>([]);
    const [loadingRecentSquads, setLoadingRecentSquads] = useState(true);
    const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        const fetchRecentSquads = async () => {
            setLoadingRecentSquads(true);
            try {
                const { data, error } = await supabase
                    .from('squads')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setRecentSquads(data || []);
            } catch (err: any) {
                console.error("Error fetching recent squads:", err);
            } finally {
                setLoadingRecentSquads(false);
            }
        };

        const fetchUserData = async () => {
            if (player.isAnonymous) {
                setLoadingUserSquads(false);
                return;
            }

            setLoadingUserSquads(true);
            try {
                const { data: squadsData, error } = await supabase
                    .from('squads')
                    .select('*')
                    .eq('captain_id', player.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const combinedSquads: UserSquad[] = (squadsData || []).map(squad => ({
                    ...squad,
                    tournament: allTournaments.find(t => t.id === squad.tournament_id)
                }));
                setUserSquads(combinedSquads);

                const registeredTournaments = new Map(
                    combinedSquads
                        .filter(s => s.status === 'Approved' || s.status === 'Pending')
                        .map(s => [s.tournament_id, s])
                );

                const available = allTournaments.filter(t =>
                    t.type === 'Squad' &&
                    t.status === 'Upcoming' &&
                    !registeredTournaments.has(t.id)
                );
                setAvailableTournaments(available);

                if (available.length > 0) {
                    setSelectedTournamentId(String(available[0].id));
                } else {
                    setSelectedTournamentId('');
                }

            } catch (err: any) {
                console.error("Error fetching user squad data:", err);
                setError("Could not load your registration data.");
            } finally {
                setLoadingUserSquads(false);
            }
        };

        fetchRecentSquads();
        fetchUserData();
    }, [player, allTournaments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setSquadName('');
        setPlayer2Name('');
        setPlayer3Name('');
        setPlayer4Name('');
        setWhatsappNumber(player.phone || '');
        setContactEmail(player.email || '');
        setBkashNumber('');
        setBkashLast4('');
        setScreenshotFile(null);
        setScreenshotPreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedTournamentId) {
            setError("Please select a tournament to register for.");
            return;
        }

        if (!squadName || !player2Name || !player3Name || !player4Name || !whatsappNumber || !contactEmail) {
            setError("Please fill in all squad details.");
            return;
        }

        if (!bkashNumber || !bkashLast4 || !screenshotFile) {
            setError("Please provide all payment details, including the screenshot.");
            return;
        }

        if (player.isAnonymous) {
            setError("You must be signed in to register a squad.");
            return;
        }
        
        setIsSubmitting(true);

        try {
            const fileExt = screenshotFile.name.split('.').pop();
            const fileName = `squad-${player.id}-${Date.now()}.${fileExt}`;
            const filePath = `squad_screenshots/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('screenshots').upload(filePath, screenshotFile);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(filePath);
            if (!urlData) throw new Error("Could not get public URL for screenshot");

            const newSquad: SquadInsert = {
                squad_name: squadName,
                captain_id: player.id,
                captain_name: player.name,
                player2_name: player2Name,
                player3_name: player3Name,
                player4_name: player4Name,
                whatsapp_number: whatsappNumber,
                contact_email: contactEmail,
                status: 'Pending',
                bkash_number: bkashNumber,
                bkash_last4: bkashLast4,
                payment_screenshot_url: urlData.publicUrl,
                tournament_id: parseInt(selectedTournamentId),
            };
            
            const { data: squadData, error: insertError } = await supabase.from('squads').insert(newSquad).select().single();
            if (insertError) throw insertError;
            
            const newFullSquadData: UserSquad = {
                ...squadData,
                tournament: allTournaments.find(t => t.id === squadData.tournament_id)
            };
            setUserSquads(prev => [newFullSquadData, ...prev]);
            setRecentSquads(prev => [squadData, ...prev].slice(0, 5));
            setSuccess('Your squad has been registered successfully! Please wait for admin approval.');
            resetForm();

        } catch (err: any) {
            console.error("Error submitting squad registration:", err);
            setError(`Failed to submit registration: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = (text: string | null) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        }
    }

    const selectedTournamentForFee = allTournaments.find(t => t.id === parseInt(selectedTournamentId));
    const entryFee = selectedTournamentForFee?.entry_fee ?? 0;
    
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
            <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-3xl font-display text-brand-yellow">My Squad Registrations</h2>
                {loadingUserSquads ? (
                    <p className="text-light-2 text-center py-4">Loading your registrations...</p>
                ) : userSquads.length > 0 ? (
                    <div className="mt-6 space-y-4">
                        {userSquads.map(squad => {
                            const statusStyle = squad.status === 'Pending' ? 'bg-brand-yellow text-dark-1' :
                                                squad.status === 'Approved' ? 'bg-brand-green text-dark-1' :
                                                'bg-red-800 text-white';
                            return (
                                <div key={squad.id} className="bg-dark-3 p-4 rounded-lg font-sans transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <p className="font-bold text-lg text-white">{squad.squad_name}</p>
                                            <p className="text-sm text-light-2">Tournament: {squad.tournament?.name || 'Unknown Tournament'}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full text-center ${statusStyle}`}>
                                            {squad.status}
                                        </span>
                                    </div>
                                    {squad.status === 'Approved' && squad.tournament?.status === 'Ongoing' && (
                                        <div className="mt-4 pt-4 border-t border-white/20 space-y-4 text-center">
                                            <h3 className="text-lg font-semibold text-brand-green">Room Details</h3>
                                            <div>
                                                <p className="text-sm text-light-2">Room ID</p>
                                                <p onClick={() => handleCopy(squad.tournament?.room_id)} className="text-2xl font-mono bg-dark-1 inline-block px-6 py-2 rounded-lg text-white tracking-widest cursor-pointer mt-1" title="Click to copy">{squad.tournament.room_id || 'Not set'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-light-2">Room Password</p>
                                                <p onClick={() => handleCopy(squad.tournament?.room_password)} className="text-2xl font-mono bg-dark-1 inline-block px-6 py-2 rounded-lg text-white tracking-widest cursor-pointer mt-1" title="Click to copy">{squad.tournament.room_password || 'Not set'}</p>
                                            </div>
                                        </div>
                                    )}
                                    {squad.status === 'Approved' && squad.tournament?.status !== 'Ongoing' && (
                                        <p className="mt-2 text-sm text-green-300">Approved! Room details will be shown here when the tournament starts.</p>
                                    )}
                                    {squad.status === 'Rejected' && (
                                        <p className="mt-2 text-sm text-red-400">Your registration was rejected. Please review the requirements and feel free to register for another available tournament.</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-light-2 text-center py-8 font-sans">You haven't registered any squads yet. Use the form below to get started!</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6 md:p-8 space-y-8">
                <div>
                    <h2 className="text-3xl font-display text-brand-yellow">Register a New Squad</h2>
                    <p className="text-light-2 mt-1 font-sans">Fill out the form below to enter your team into the fray.</p>
                </div>

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm font-sans" role="alert">{error}</div>}
                {success && <div className="bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md text-sm font-sans" role="alert">{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div className="md:col-span-2">
                            <label htmlFor="tournamentId" className="block text-sm font-medium text-light-2 mb-1">Select Tournament:</label>
                            <select id="tournamentId" value={selectedTournamentId} onChange={e => setSelectedTournamentId(e.target.value)} className="input-field" required disabled={availableTournaments.length === 0}>
                                {availableTournaments.length > 0 ? (
                                    availableTournaments.map(t => <option key={t.id} value={t.id}>{t.name} (Fee: ৳{t.entry_fee})</option>)
                                ) : (
                                    <option value="">No upcoming squad tournaments available</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="squadName" className="block text-sm font-medium text-light-2 mb-1">Squad Name:</label>
                            <input id="squadName" type="text" value={squadName} onChange={e => setSquadName(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-2 mb-1">Captain Name (You):</label>
                            <input type="text" value={player.name} className="input-field bg-dark-3/50 cursor-not-allowed" disabled />
                        </div>
                        <div>
                            <label htmlFor="player2Name" className="block text-sm font-medium text-light-2 mb-1">Player 2 Name:</label>
                            <input id="player2Name" type="text" value={player2Name} onChange={e => setPlayer2Name(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="player3Name" className="block text-sm font-medium text-light-2 mb-1">Player 3 Name:</label>
                            <input id="player3Name" type="text" value={player3Name} onChange={e => setPlayer3Name(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="player4Name" className="block text-sm font-medium text-light-2 mb-1">Player 4 Name:</label>
                            <input id="player4Name" type="text" value={player4Name} onChange={e => setPlayer4Name(e.target.value)} className="input-field" required />
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-light-2 mb-1">WhatsApp Number:</label>
                            <input id="whatsappNumber" type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-light-2 mb-1">Email Address:</label>
                            <input id="email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="input-field" required />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-lg font-display text-white">Payment Details</h3>
                            <p className="text-sm text-yellow-200 bg-yellow-900/50 p-3 rounded-lg font-sans">Pay the entry fee <strong className="text-white">৳{entryFee} BDT</strong> to our bKash number: <strong className="text-white">01301440744</strong> (Send Money), then fill the form below.</p>
                             <input type="tel" placeholder="Your bKash Number" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} required className="input-field" />
                             <input type="tel" placeholder="Last 4 Digits of Transaction ID" value={bkashLast4} onChange={(e) => setBkashLast4(e.target.value)} maxLength={4} required className="input-field" />
                             <div 
                                className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-brand-green transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                                role="button" tabIndex={0} aria-label="Upload payment screenshot">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" required className="hidden" />
                                {screenshotPreview ? (
                                  <img src={screenshotPreview} alt="Payment Preview" className="max-h-32 mx-auto rounded-lg" />
                                ) : (
                                  <div className="text-light-2">
                                    <ArrowUpTrayIcon className="h-10 w-10 mx-auto mb-2 text-gray-500"/>
                                    <p>Upload Payment Screenshot</p>
                                    <p className="text-xs font-sans">PNG, JPG up to 5MB</p>
                                  </div>
                                )}
                              </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <button type="submit" disabled={isSubmitting || availableTournaments.length === 0} className="w-full md:w-auto md:px-10 btn btn-secondary">
                        {isSubmitting ? 'Submitting...' : 'Register Squad'}
                    </button>
                </div>
            </form>

            <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-6 md:p-8">
                 <h2 className="text-3xl font-display text-brand-yellow">Recently Registered</h2>
                 <div className="mt-6">
                    {loadingRecentSquads ? (
                        <p className="text-light-2 text-center py-4">Loading recent squads...</p>
                    ) : recentSquads.length > 0 ? (
                        <ul className="space-y-4">
                            {recentSquads.map(squad => (
                                <li key={squad.id} className="bg-dark-3 p-4 rounded-lg flex justify-between items-center font-sans">
                                    <div>
                                        <p className="font-bold text-lg text-white">{squad.squad_name}</p>
                                        <p className="text-sm text-light-2">Captain: {squad.captain_name}</p>
                                    </div>
                                    <span className="text-xs text-light-2">{new Date(squad.created_at).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-light-2 text-center py-8 font-sans">No squads registered yet.</p>
                    )}
                 </div>
            </div>
        </div>
    )
}

export default SquadRegistration;