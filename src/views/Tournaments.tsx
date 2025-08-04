
import React, { useState, useContext } from 'react';
import { Tournament } from '../types';
import { AppContext, AppContextType } from '../contexts/AppContext';
import TournamentCard from '../components/TournamentCard';

type FilterStatus = 'All' | 'Upcoming' | 'Ongoing' | 'Finished';

const AngledTab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-6 md:px-8 py-3 font-display uppercase text-xs md:text-sm tracking-wider transition-colors duration-300 ${isActive ? 'bg-brand-green text-dark-1' : 'bg-dark-3 text-light-2 hover:bg-white/10'}`}
            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
        >
            {label}
        </button>
    )
}

const Tournaments: React.FC = () => {
  const { tournaments, navigateToTournamentDetails, siteContent } = useContext(AppContext) as AppContextType;
  const [filter, setFilter] = useState<FilterStatus>('All');

  const handleCardClick = (tournament: Tournament) => {
    navigateToTournamentDetails(tournament);
  };
  
  const filteredTournaments = tournaments.filter(t => {
      if (filter === 'All') return true;
      // Handle "All Match" case where "Ongoing" should also be displayed
      if (filter === 'Upcoming' && t.status === 'Ongoing') return true;
      return t.status === filter;
  });

  return (
    <>
      <div className="space-y-12">
        <div className="text-center">
            <p className="text-brand-green font-display tracking-widest">{siteContent['tournaments_page_subtitle'] || '# Game Streaming Battle'}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{siteContent['tournaments_page_title'] || 'Our Gaming Tournaments!'}</h1>
        </div>
        
        <div className="flex flex-wrap justify-center items-center bg-dark-2 p-1 rounded-lg max-w-full sm:max-w-max mx-auto">
            <AngledTab label="All Match" isActive={filter === 'All'} onClick={() => setFilter('All')} />
            <AngledTab label="Upcoming" isActive={filter === 'Upcoming'} onClick={() => setFilter('Upcoming')} />
            <AngledTab label="Finished" isActive={filter === 'Finished'} onClick={() => setFilter('Finished')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map(t => (
            <TournamentCard 
              key={t.id} 
              tournament={t} 
              onClick={handleCardClick}
            />
          ))}
        </div>
        {filteredTournaments.length === 0 && (
            <p className="text-center text-light-2 py-10">No tournaments match the current filter.</p>
        )}
      </div>
    </>
  );
};

export default Tournaments;
