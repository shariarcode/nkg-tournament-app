import React, { useContext } from 'react';
import { View, AppContext, AppContextType } from '../contexts/AppContext';
import { ChevronDownIcon, SearchIcon, FacebookIcon, TwitterIcon, InstagramIcon, UserIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isAdminView: boolean;
  onSetIsAdminView: React.Dispatch<React.SetStateAction<boolean>>;
  isUserAdmin: boolean;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
}> = ({ label, isActive, onClick, hasDropdown }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors duration-200 uppercase font-display tracking-widest ${
      isActive
        ? 'text-brand-green'
        : 'text-light-2 hover:text-light-1'
    }`}
  >
    <span>{label}</span>
    {hasDropdown && <ChevronDownIcon className="h-3 w-3" />}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isUserAdmin, isAdminView, onSetIsAdminView }) => {
  const { player, signOut } = useContext(AppContext) as AppContextType;

  return (
    <header className="bg-dark-1/80 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10">
      {/* Top Bar */}
      <div className="hidden md:block border-b border-white/10">
        <div className="container mx-auto px-4 h-10 flex justify-between items-center text-xs text-light-2">
            <div>
              <span>Welcome to our Bame Esports team</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-white transition-colors"><FacebookIcon className="w-4 h-4"/></a>
              <a href="#" className="hover:text-white transition-colors"><TwitterIcon className="w-4 h-4"/></a>
              <a href="#" className="hover:text-white transition-colors"><InstagramIcon className="w-4 h-4"/></a>
            </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
             <img src="/favicon.svg" alt="Bame Logo" className="h-10 w-10"/>
             <span className="text-3xl font-display text-white">Bame</span>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-2">
            <NavItem label="Home" isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <NavItem label="Tournaments" isActive={currentView === 'tournaments'} onClick={() => onNavigate('tournaments')} />
            <NavItem label="Leaderboard" isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
            <NavItem label="Profile" isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
          </nav>
          
          <div className="flex items-center space-x-4">
              <button className="text-light-2 hover:text-white"><SearchIcon className="h-5 w-5"/></button>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                 <img src={player.profilePicUrl} alt="Player" className="h-9 w-9 rounded-full border-2 border-brand-green object-cover"/>
                 <span className="hidden sm:inline text-sm font-medium text-light-1">{player.name}</span>
              </div>
              <button className="btn btn-primary !px-5 !py-2.5">Live Streaming</button>
              <button onClick={signOut} className="text-light-2 hover:text-white" aria-label="Sign Out">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-dark-2 border-t border-white/10">
          <div className="flex justify-around py-2">
            <NavItem label="Home" isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <NavItem label="Tournaments" isActive={currentView === 'tournaments'} onClick={() => onNavigate('tournaments')} />
            <NavItem label="Leaderboard" isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
            <NavItem label="Profile" isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
          </div>
      </div>
    </header>
  );
};

export default Header;
