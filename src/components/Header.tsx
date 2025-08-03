
import React, { useContext } from 'react';
import { View, AppContext, AppContextType } from '../contexts/AppContext';
import { ChevronDownIcon, SearchIcon, FacebookIcon, TwitterIcon, InstagramIcon, NKGLogoIcon } from './Icons';
import { SiteContent } from '../types';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isAdminView: boolean;
  onSetIsAdminView: React.Dispatch<React.SetStateAction<boolean>>;
  isUserAdmin: boolean;
  onSearchClick: () => void;
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

// Helper to get live URLs, handles legacy single URL and new JSON array format
const getLiveUrls = (content: SiteContent, key: string, legacyKey: string): string[] => {
    const urlsJson = content[key];
    if (urlsJson) {
        try {
            const parsed = JSON.parse(urlsJson);
            if(Array.isArray(parsed)) return parsed.filter(u => u && typeof u === 'string' && u.trim() !== '');
        } catch {}
    }
    const legacyUrl = content[legacyKey];
    if (legacyUrl && typeof legacyUrl === 'string' && legacyUrl.trim() !== '') {
        return [legacyUrl];
    }
    return [];
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isUserAdmin, isAdminView, onSetIsAdminView, onSearchClick }) => {
  const { player, signOut, siteContent } = useContext(AppContext) as AppContextType;

  const youtubeUrls = getLiveUrls(siteContent || {}, 'youtube_live_urls', 'youtube_live_url');
  const facebookUrls = getLiveUrls(siteContent || {}, 'facebook_live_urls', 'facebook_live_url');
  const isLive = youtubeUrls.length > 0 || facebookUrls.length > 0;

  return (
    <header className="bg-dark-1/80 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10">
      {/* Top Bar */}
      <div className="hidden md:block border-b border-white/10">
        <div className="container mx-auto px-4 h-10 flex justify-between items-center text-xs text-light-2">
            <div>
              <span>Welcome to our NKG Tournament team</span>
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
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
             <NKGLogoIcon className="h-9 w-auto" />
          </div>
          
          <nav className="hidden lg:flex items-center space-x-2">
            <NavItem label="Home" isActive={currentView === 'home'} onClick={() => onNavigate('home')} />
            <NavItem label="Tournaments" isActive={currentView === 'tournaments'} onClick={() => onNavigate('tournaments')} />
            <NavItem label="Register Squad" isActive={currentView === 'squadRegistration'} onClick={() => onNavigate('squadRegistration')} />
            <div className="relative">
                <NavItem label="Live" isActive={currentView === 'live'} onClick={() => onNavigate('live')} />
                {isLive && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
            <NavItem label="Leaderboard" isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
            <NavItem label="Profile" isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
          </nav>
          
          <div className="flex items-center space-x-2 md:space-x-4">
              <button onClick={onSearchClick} className="text-light-2 hover:text-white"><SearchIcon className="h-5 w-5"/></button>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                 <img src={player.profilePicUrl} alt="Player" className="h-9 w-9 rounded-full border-2 border-brand-green object-cover"/>
                 <span className="hidden sm:inline text-sm font-medium text-light-1">{player.name}</span>
              </div>
              {isUserAdmin && (
                <button 
                  onClick={() => onSetIsAdminView(!isAdminView)} 
                  className="btn !px-4 !py-2 bg-brand-yellow text-dark-1 hover:bg-opacity-80 shadow-yellow-glow"
                >
                  {isAdminView ? 'Exit' : 'Admin'}
                </button>
              )}
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
            <NavItem label="Register Squad" isActive={currentView === 'squadRegistration'} onClick={() => onNavigate('squadRegistration')} />
            <div className="relative">
                <NavItem label="Live" isActive={currentView === 'live'} onClick={() => onNavigate('live')} />
                {isLive && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
            <NavItem label="Leaderboard" isActive={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
            <NavItem label="Profile" isActive={currentView === 'profile'} onClick={() => onNavigate('profile')} />
          </div>
      </div>
    </header>
  );
};

export default Header;
