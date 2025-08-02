import React from 'react';
import { Tournament } from '../types';
import { YoutubeIcon, TwitchIcon } from './Icons';

interface TournamentCardProps {
  tournament: Tournament;
  onClick: (tournament: Tournament) => void;
}

const PlayerLogo: React.FC = () => (
    <div className="w-20 h-20 bg-dark-3 rounded-md flex items-center justify-center ring-1 ring-white/10">
        <img src="/favicon.svg" alt="Player Logo" className="w-12 h-12 opacity-50" />
    </div>
);

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onClick }) => {
    const isFinished = tournament.status === 'Finished';
    const isUpcoming = tournament.status === 'Upcoming';
    const isOngoing = tournament.status === 'Ongoing';
    
    const getStatusChip = () => {
        let text = tournament.status;
        let className = 'bg-gray-500 text-white';

        if (isUpcoming) {
            text = 'Upcoming';
            className = 'bg-brand-green text-dark-1';
        } else if (isOngoing) {
            text = 'Live';
            className = 'bg-red-600 text-white animate-pulse';
        } else if (isFinished) {
            text = 'Finished';
            className = 'bg-dark-3 text-light-2';
        }

        return <div className={`absolute top-4 right-4 text-xs font-display uppercase px-3 py-1 rounded-full ${className}`} style={{clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)'}}>{text}</div>;
    }

    return (
        <div 
            className="card-border group cursor-pointer"
            onClick={() => onClick(tournament)}
        >
            <div className={`card-border-content p-6 flex items-center gap-6 transition-all duration-300 hover:bg-dark-3/50 relative ${isFinished ? 'opacity-70' : ''}`}>
                
                <div className="flex items-center gap-4">
                    <PlayerLogo />
                    <span className="font-display text-3xl text-light-2">VS</span>
                    <PlayerLogo />
                </div>

                <div className="flex-1">
                    {getStatusChip()}
                    <h3 className="text-xl text-white group-hover:text-brand-green transition-colors mb-2 mt-4">{tournament.name}</h3>
                    <p className="text-sm font-sans text-light-2 mb-3">{tournament.date} @ {tournament.time}</p>
                    <div className="flex items-center gap-4">
                        <a href="#" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-light-2 hover:text-white transition-colors text-sm">
                            <YoutubeIcon className="w-5 h-5 text-red-600" />
                            <span>Youtube</span>
                        </a>
                        <a href="#" onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-light-2 hover:text-white transition-colors text-sm">
                            <TwitchIcon className="w-5 h-5 text-purple-500" />
                            <span>Twitch</span>
                        </a>
                    </div>
                </div>

                {!isFinished && 
                    <div className="absolute bottom-4 right-4 bg-dark-1 px-3 py-1 rounded-md border border-white/10">
                        <p className="text-xs font-sans text-light-2">Prize: <span className="font-bold text-brand-yellow">{tournament.prize_pool.toLocaleString()} BDT</span></p>
                    </div>
                }
            </div>
        </div>
    );
};

export default TournamentCard;
