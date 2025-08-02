import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { Tournament } from '../types';
import { SearchIcon, XMarkIcon } from './Icons';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const { tournaments, navigateToTournamentDetails } = useContext(AppContext) as AppContextType;
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Tournament[]>([]);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce the input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300); // 300ms debounce time

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim() === '') {
            setResults([]);
            return;
        }

        const lowercasedQuery = debouncedQuery.toLowerCase();
        const filtered = tournaments.filter(t => 
            t.name.toLowerCase().includes(lowercasedQuery)
        );
        setResults(filtered);
    }, [debouncedQuery, tournaments]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            // A short timeout is needed to allow the modal to render before focusing
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
        }
    }, [isOpen]);

    const handleResultClick = (tournament: Tournament) => {
        navigateToTournamentDetails(tournament);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50 pt-20 p-4" onClick={onClose}>
            <div 
                className="bg-dark-2 rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center p-4 border-b border-white/20">
                    <SearchIcon className="h-6 w-6 text-brand-green"/>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for tournaments..."
                        className="flex-1 bg-transparent px-4 py-2 text-white text-lg placeholder-light-2/50 focus:outline-none"
                    />
                    <button onClick={onClose} className="text-light-2 hover:text-white">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                {/* Search Results */}
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {query.trim() !== '' && results.length === 0 && (
                        <div className="text-center p-8 text-light-2 font-sans">
                            No tournaments found for "{query}".
                        </div>
                    )}
                    {results.length > 0 && (
                        <ul className="space-y-1">
                            {results.map(tournament => (
                                <li key={tournament.id}>
                                    <button 
                                        onClick={() => handleResultClick(tournament)}
                                        className="w-full text-left p-4 rounded-lg hover:bg-dark-3 transition-colors flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-bold text-light-1">{tournament.name}</p>
                                            <p className="text-sm text-light-2">{tournament.date} @ {tournament.time}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                            tournament.status === 'Upcoming' ? 'bg-brand-green text-dark-1' :
                                            tournament.status === 'Ongoing' ? 'bg-red-600 text-white' :
                                            'bg-dark-3 text-light-2'
                                        }`}>
                                            {tournament.status}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                     {query.trim() === '' && (
                        <div className="text-center p-8 text-light-2 font-sans">
                            Start typing to search for a tournament.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
