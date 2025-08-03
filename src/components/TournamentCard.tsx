import React from 'react';
import { Tournament } from '../types';
import { GameIcon } from './Icons';

interface TournamentCardProps {
  tournament: Tournament;
  onClick: (tournament: Tournament) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onClick }) => {
  const {
    name,
    date,
    time,
    prize_pool,
    per_kill_prize,
    entry_fee,
    type,
    version,
    map,
    spots_filled,
    total_spots,
    banner_image_url,
    status,
  } = tournament;

  const isFinished = status === 'Finished';
  const spotsLeft = (total_spots ?? 0) - (spots_filled ?? 0);
  const progress = total_spots ? ((spots_filled ?? 0) / total_spots) * 100 : 0;
  
  const detailItem = (label: string, value: React.ReactNode, valueClassName: string = "text-white") => (
    <div className="font-sans">
      <p className="text-xs text-light-2 uppercase">{label}</p>
      <p className={`text-base font-bold ${valueClassName}`}>{value}</p>
    </div>
  );

  return (
    <div 
        className={`bg-dark-2 rounded-lg overflow-hidden border border-white/10 transition-all duration-300 group ${isFinished ? 'opacity-60' : 'hover:border-brand-green hover:-translate-y-1 cursor-pointer'}`} 
        onClick={() => !isFinished && onClick(tournament)}
    >
      {/* Banner Image */}
      <div className="relative">
        <img 
          src={banner_image_url || 'https://placehold.co/1280x400/08090A/121415?text=NKG+TOURNAMENT'} 
          alt={name} 
          className="w-full h-40 object-cover"
        />
        {status === 'Ongoing' && (
             <div className="absolute top-4 right-4 text-xs font-display uppercase px-3 py-1 rounded-full bg-red-600 text-white animate-pulse" style={{clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)'}}>Live</div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <GameIcon className="w-12 h-12 flex-shrink-0 text-light-2/80" />
          <div className="flex-1">
            <h3 className="font-display text-lg text-white leading-tight group-hover:text-brand-green transition-colors">{name}</h3>
            <p className="font-sans text-sm text-light-2">Time: {date} at {time}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 mb-5">
          {detailItem('Prize Pool', `৳${prize_pool.toLocaleString()}`, 'text-brand-yellow')}
          {detailItem('Per Kill', `৳${per_kill_prize || 0}`)}
          {detailItem('Play For', entry_fee === 0 ? 'FREE' : `৳${entry_fee}`, entry_fee === 0 ? 'text-brand-green font-display' : '')}
          {detailItem('Type', type || 'N/A')}
          {detailItem('Version', version || 'N/A')}
          {detailItem('Map', map || 'N/A')}
        </div>

        {/* Progress or Finished Status */}
        {isFinished ? (
            <div className="mt-6 text-center h-[72px] flex items-center justify-center">
                <p className="font-display text-xl text-light-2/70 uppercase">Finished</p>
            </div>
        ) : (
            <>
                <div className="space-y-2 font-sans">
                    <div className="flex justify-between items-center text-xs text-light-2">
                        <span>Only {spotsLeft > 0 ? spotsLeft : 0} Spots Left</span>
                        <span>{spots_filled || 0}/{total_spots || 0}</span>
                    </div>
                    <div className="w-full bg-dark-3 rounded-full h-2">
                        <div className="bg-brand-yellow h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="mt-5">
                    <button className="w-full btn btn-primary">Join</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;