
import React, { useState, useContext } from 'react';
import { Tournament } from '../types';
import { AppContext, AppContextType } from '../contexts/AppContext';
import TournamentCard from '../components/TournamentCard';
import JoinTournamentModal from '../components/JoinTournamentModal';

const Tournaments: React.FC = () => {
  const { tournaments, player, registrations, navigateToTournamentDetails } = useContext(AppContext) as AppContextType;
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleJoinClick = (tournament: Tournament) => {
    if (player.isAnonymous) {
      alert("Please sign up or sign in to join a tournament.");
      return;
    }
    
    // Safeguard: do not open modal if already registered. The button should be disabled anyway.
    const isAlreadyRegistered = registrations.some(r => r.playerId === player.id && r.tournamentId === tournament.id);
    if(isAlreadyRegistered) {
      return;
    }

    setSelectedTournament(tournament);
  };
  
  const handleViewDetailsClick = (tournament: Tournament) => {
    navigateToTournamentDetails(tournament);
  };

  const handleCloseModal = () => {
    setSelectedTournament(null);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Upcoming Tournaments</h1>
            <p className="mt-2 text-gray-400">Find your next challenge and compete for glory (and prizes!)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => {
            const registration = registrations.find(r => r.playerId === player.id && r.tournamentId === t.id);
            const registrationStatus = registration ? registration.status : null;
            return (
              <TournamentCard 
                key={t.id} 
                tournament={t} 
                onJoin={handleJoinClick}
                onViewDetails={handleViewDetailsClick}
                registrationStatus={registrationStatus}
              />
            );
          })}
        </div>
      </div>
      {selectedTournament && (
        <JoinTournamentModal 
          tournament={selectedTournament} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default Tournaments;