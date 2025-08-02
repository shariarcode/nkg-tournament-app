import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';

const Leaderboard: React.FC = () => {
    const { leaderboard } = useContext(AppContext) as AppContextType;

    const getBorderColor = (rank: number) => {
        if (rank === 1) return 'border-brand-yellow';
        if (rank === 2) return 'border-pink-500';
        if (rank === 3) return 'border-brand-green';
        if (rank === 4) return 'border-sky-400';
        return 'border-gray-700';
    };
    
    const getGlowColor = (rank: number) => {
        if (rank === 1) return 'hover:shadow-yellow-glow';
        if (rank === 2) return 'hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'; // pink glow
        if (rank === 3) return 'hover:shadow-green-glow';
        if (rank === 4) return 'hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]'; // sky glow
        return 'hover:shadow-[0_0_15px_rgba(100,116,139,0.4)]';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center">
                <p className="text-brand-green font-display tracking-widest"># Top World Class Gamer</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Let's See Our Pro Players</h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                {leaderboard.slice(0, 5).map((player, index) => (
                    <div 
                        key={player.id} 
                        className="group animate-fade-in-up" 
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={`relative rounded-2xl border-2 ${getBorderColor(player.rank || 0)} bg-dark-2 p-1.5 transition-all duration-300 group-hover:-translate-y-2 ${getGlowColor(player.rank || 0)}`}>
                            <img 
                                src={player.profile_pic_url || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${player.player_name}`} 
                                alt={player.player_name} 
                                className="w-full h-auto rounded-xl object-cover aspect-[3/4]"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-center bg-dark-2/50 backdrop-blur-sm rounded-b-xl">
                                <h3 className="font-display text-base text-white uppercase tracking-wider truncate">{player.player_name}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;