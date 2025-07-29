
import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { TrophyIcon } from '../components/Icons';

const Leaderboard: React.FC = () => {
    const { leaderboard } = useContext(AppContext) as AppContextType;

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500 text-yellow-900';
        if (rank === 2) return 'bg-gray-400 text-gray-800';
        if (rank === 3) return 'bg-yellow-600 text-yellow-100';
        return 'bg-gray-700 text-gray-300';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white">Top Players Leaderboard</h1>
                <p className="mt-2 text-gray-400">See who's dominating the competition.</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-700">
                    {leaderboard.map((player, index) => (
                        <li key={player.rank} className={`flex items-center p-4 transition-colors duration-200 ${index === 0 ? 'bg-red-500/10' : 'hover:bg-gray-700/50'}`}>
                            <div className="flex items-center space-x-4 w-full">
                                <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full ${getRankColor(player.rank)}`}>
                                    {player.rank}
                                </span>
                                <img src={player.profilePicUrl} alt={player.playerName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-white">{player.playerName}</p>
                                </div>
                                <div className="flex items-center text-green-400 font-bold text-lg">
                                    <TrophyIcon className="w-5 h-5 mr-2 text-green-500" />
                                    <span>{player.winnings.toLocaleString()} BDT</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;