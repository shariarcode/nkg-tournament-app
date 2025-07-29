
import React from 'react';
import { Tournament, RegistrationStatus } from '../types';
import { TrophyIcon } from './Icons';

interface TournamentCardProps {
  tournament: Tournament;
  onJoin: (tournament: Tournament) => void;
  onViewDetails: (tournament: Tournament) => void;
  registrationStatus: RegistrationStatus | null;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onJoin, onViewDetails, registrationStatus }) => {
  const isFinished = tournament.status === 'Finished';

  const getButtonState = () => {
    if (isFinished) {
      return { text: 'Finished', disabled: true, className: 'bg-gray-600 cursor-not-allowed hover:bg-gray-600' };
    }
    if (registrationStatus === 'Approved') {
      return { text: 'View Details', disabled: false, className: 'bg-green-600 text-white hover:bg-green-700' };
    }
    if (registrationStatus === 'Pending') {
      return { text: 'Pending', disabled: true, className: 'bg-yellow-500 text-black cursor-not-allowed hover:bg-yellow-500' };
    }
    if (registrationStatus === 'Rejected') {
      return { text: 'Rejected', disabled: true, className: 'bg-red-800 text-white cursor-not-allowed hover:bg-red-800' };
    }
    return { text: 'Join Now', disabled: false, className: 'bg-red-600 text-white hover:bg-red-700' };
  };

  const { text, disabled, className } = getButtonState();

  const handleClick = () => {
    if(disabled) return;

    if (registrationStatus === 'Approved') {
        onViewDetails(tournament);
    } else {
        onJoin(tournament);
    }
  }

  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-red-500/20 hover:scale-[1.02] border border-gray-700 ${isFinished ? 'opacity-60' : ''}`}>
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4">
        <h3 className="text-xl font-bold text-white truncate">{tournament.name}</h3>
        <p className="text-sm text-gray-400">{tournament.date} at {tournament.time}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Entry Fee:</span>
          <span className="text-red-500 font-bold text-lg">{tournament.entryFee} BDT</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Prize Pool:</span>
          <span className="text-green-500 font-bold text-lg">{tournament.prizePool} BDT</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Status:</span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            tournament.status === 'Upcoming' ? 'bg-blue-600 text-white' : 
            tournament.status === 'Ongoing' ? 'bg-yellow-500 text-black' : 
            'bg-gray-600 text-gray-200'
          }`}>
            {tournament.status}
          </span>
        </div>
      </div>
      <div className="p-4 bg-gray-800/50">
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`w-full font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${className}`}
        >
          <TrophyIcon className="h-5 w-5" />
          <span>{text}</span>
        </button>
      </div>
    </div>
  );
};

export default TournamentCard;