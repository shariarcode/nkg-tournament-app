import React, { useContext, useState } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Tournament } from '../types';
import JoinTournamentModal from '../components/JoinTournamentModal';

interface TournamentDetailsProps {
    tournament: Tournament;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ tournament }) => {
    const { navigate, player, registrations } = useContext(AppContext) as AppContextType;
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const handleCopy = (text: string | null) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        }
    }

    const isUpcoming = tournament.status === 'Upcoming';
    const registration = registrations.find(r => r.player_id === player.id && r.tournament_id === tournament.id);

    const getCTAButton = () => {
        if (!isUpcoming) return null; // No button if not upcoming
        
        if (registration) {
             const status = registration.status;
             let style = 'btn bg-gray-600 text-white cursor-not-allowed';
             if (status === 'Pending') style = 'btn bg-brand-yellow text-dark-1 cursor-not-allowed';
             if (status === 'Approved') style = 'btn bg-brand-green text-dark-1 cursor-not-allowed';
             if (status === 'Rejected') style = 'btn bg-red-800 text-white cursor-not-allowed';

             return <button disabled className={style}>{status}</button>;
        }

        return <button onClick={() => setIsJoinModalOpen(true)} className="btn btn-primary">Join Tournament</button>;
    }


    return (
        <>
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{tournament.name}</h1>
                    <p className="mt-2 text-light-2 font-sans">{tournament.date} at {tournament.time}</p>
                </div>
                
                <div className="bg-dark-2 border border-white/10 rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-8 text-brand-green text-center">Room Information</h2>
                    
                    {tournament.status === 'Ongoing' && (tournament.room_id || tournament.room_password) ? (
                        <div className="space-y-8 text-center font-sans">
                            <div>
                                <p className="text-lg text-light-2">Room ID</p>
                                <p onClick={() => handleCopy(tournament.room_id)} className="text-4xl font-mono bg-dark-3 inline-block px-8 py-3 rounded-lg text-white tracking-widest cursor-pointer mt-2" title="Click to copy">{tournament.room_id || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-lg text-light-2">Room Password</p>
                                <p onClick={() => handleCopy(tournament.room_password)} className="text-4xl font-mono bg-dark-3 inline-block px-8 py-3 rounded-lg text-white tracking-widest cursor-pointer mt-2" title="Click to copy">{tournament.room_password || 'Not set'}</p>
                            </div>
                            <p className="text-sm text-yellow-300 pt-4">Please do not share these details with anyone not participating in the tournament.</p>
                        </div>
                    ) : (
                        <div className="text-center text-light-1 py-8 font-sans">
                            <p className="text-xl">Room details will be available when the tournament is ongoing.</p>
                            <p className="mt-2">Current Status: 
                                <span className={`ml-2 px-3 py-1 text-sm font-bold rounded-full ${
                                    tournament.status === 'Upcoming' ? 'bg-blue-600 text-white' : 
                                    tournament.status === 'Ongoing' ? 'bg-yellow-500 text-black' : 
                                    'bg-gray-600 text-gray-200'
                                }`}>
                                    {tournament.status}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-center flex justify-center items-center gap-4">
                    <button
                        onClick={() => navigate('tournaments')}
                        className="btn bg-dark-3 text-light-1 hover:bg-white/10"
                    >
                        Back to All Tournaments
                    </button>
                    {getCTAButton()}
                </div>
            </div>
            {isJoinModalOpen && (
                <JoinTournamentModal 
                    tournament={tournament}
                    onClose={() => setIsJoinModalOpen(false)}
                />
            )}
        </>
    );
};

export default TournamentDetails;