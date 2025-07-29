import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Tournament } from '../types';

interface TournamentDetailsProps {
    tournament: Tournament;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ tournament }) => {
    const { navigate } = useContext(AppContext) as AppContextType;
    const showRoomDetails = tournament.status === 'Ongoing';

    const handleCopy = (text: string | null) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
                <p className="mt-2 text-gray-400">{tournament.date} at {tournament.time}</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-red-500 text-center">Room Information</h2>
                
                {showRoomDetails && (tournament.room_id || tournament.room_password) ? (
                    <div className="space-y-6 text-center">
                        <div>
                            <p className="text-lg text-gray-400">Room ID</p>
                            <p onClick={() => handleCopy(tournament.room_id)} className="text-3xl font-mono bg-gray-900 inline-block px-8 py-3 rounded-lg text-white tracking-widest cursor-pointer" title="Click to copy">{tournament.room_id || 'Not set'}</p>
                        </div>
                        <div>
                            <p className="text-lg text-gray-400">Room Password</p>
                            <p onClick={() => handleCopy(tournament.room_password)} className="text-3xl font-mono bg-gray-900 inline-block px-8 py-3 rounded-lg text-white tracking-widest cursor-pointer" title="Click to copy">{tournament.room_password || 'Not set'}</p>
                        </div>
                        <p className="text-sm text-yellow-400 pt-4">Please do not share these details with anyone not participating in the tournament.</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-300 py-8">
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

             <div className="text-center">
                <button
                    onClick={() => navigate('tournaments')}
                    className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 hover:scale-105 hover:bg-red-700"
                >
                    Back to All Tournaments
                </button>
            </div>
        </div>
    );
};

export default TournamentDetails;