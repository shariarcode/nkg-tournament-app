
import React, { useContext, useState, useEffect } from 'react';
import { View, AppContext, AppContextType } from '../contexts/AppContext';
import { ChevronDownIcon, SearchIcon, FacebookIcon, TwitterIcon, InstagramIcon, NKGLogoIcon, SunIcon, MoonIcon, MenuIcon, XMarkIcon } from './Icons';
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
        : 'text-dark-text-secondary dark:text-light-2 hover:text-dark-text dark:hover:text-light-1'
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
  const { player, signOut, siteContent, theme, toggleTheme } = useContext(AppContext) as AppContextType;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);


  const youtubeUrls = getLiveUrls(siteContent || {}, 'youtube_live_urls', 'youtube_live_url');
  const facebookUrls = getLiveUrls(siteContent || {}, 'facebook_live_urls', 'facebook_live_url');
  const isLive = youtubeUrls.length > 0 || facebookUrls.length > 0;
  
  const handleMobileNav = (view: View) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  }
  
  const MobileNavItem: React.FC<{label: string, onClick: () => void}> = ({ label, onClick }) => (
    <button onClick={onClick} className="font-display uppercase tracking-widest text-2xl text-light-2 hover:text-brand-green transition-colors">
      {label}
    </button>
  );

  return (
    <>
      <header className="bg-light-bg/80 dark:bg-dark-1/80 backdrop-blur-sm sticky top-0 z-40 border-b border-black/10 dark:border-white/10">
        {/* Top Bar */}
        <div className="hidden md:block border-b border-black/10 dark:border-white/10">
          <div className="container mx-auto px-4 h-10 flex justify-between items-center text-xs text-dark-text-secondary dark:text-light-2">
              <div>
                <span>Welcome to our NKG Tournament team</span>
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-dark-text dark:hover:text-white transition-colors"><FacebookIcon className="w-4 h-4"/></a>
                <a href="#" className="hover:text-dark-text dark:hover:text-white transition-colors"><TwitterIcon className="w-4 h-4"/></a>
                <a href="#" className="hover:text-dark-text dark:hover:text-white transition-colors"><InstagramIcon className="w-4 h-4"/></a>
              </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <NKGLogoIcon className="h-8 sm:h-9 w-auto" />
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
            
            <div className="hidden lg:flex items-center space-x-2 md:space-x-4">
                <button onClick={onSearchClick} className="text-dark-text-secondary dark:text-light-2 hover:text-dark-text dark:hover:text-white"><SearchIcon className="h-5 w-5"/></button>
                <div className="w-px h-6 bg-black/20 dark:bg-white/20"></div>
                <div className="flex items-center space-x-2">
                  <img src={player.profilePicUrl} alt="Player" className="h-9 w-9 rounded-full border-2 border-brand-green object-cover"/>
                  <span className="hidden sm:inline text-sm font-medium text-dark-text dark:text-light-1">{player.name}</span>
                </div>
                {isUserAdmin && (
                  <button 
                    onClick={() => onSetIsAdminView(!isAdminView)} 
                    className="btn !px-4 !py-2 bg-brand-yellow text-dark-1 hover:bg-opacity-80 shadow-yellow-glow"
                  >
                    {isAdminView ? 'Exit' : 'Admin'}
                  </button>
                )}
                <button onClick={toggleTheme} className="text-dark-text-secondary dark:text-light-2 hover:text-dark-text dark:hover:text-white p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Toggle theme">
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
                <button onClick={signOut} className="text-dark-text-secondary dark:text-light-2 hover:text-dark-text dark:hover:text-white" aria-label="Sign Out">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2" aria-label="Open menu">
                <MenuIcon className="h-7 w-7 text-dark-text dark:text-light-1" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-dark-1 z-50 flex flex-col animate-fade-in-up duration-300">
            <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
                 <div className="flex items-center cursor-pointer" onClick={() => handleMobileNav('home')}>
                    <NKGLogoIcon className="h-9 w-auto" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                    <XMarkIcon className="h-7 w-7 text-light-1" />
                </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 flex flex-col items-center justify-center space-y-6 text-center p-4 overflow-y-auto">
                <MobileNavItem label="Home" onClick={() => handleMobileNav('home')} />
                <MobileNavItem label="Tournaments" onClick={() => handleMobileNav('tournaments')} />
                <MobileNavItem label="Register Squad" onClick={() => handleMobileNav('squadRegistration')} />
                <MobileNavItem label="Live" onClick={() => handleMobileNav('live')} />
                <MobileNavItem label="Leaderboard" onClick={() => handleMobileNav('leaderboard')} />
                <MobileNavItem label="Profile" onClick={() => handleMobileNav('profile')} />
            </nav>

            {/* Mobile Footer Actions */}
            <div className="p-4 border-t border-white/10 space-y-4">
                <button onClick={() => { onSearchClick(); setIsMobileMenuOpen(false); }} className="w-full btn bg-dark-3 text-light-1 hover:bg-white/10">
                    <SearchIcon className="h-5 w-5" /> Search
                </button>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 overflow-hidden">
                      <img src={player.profilePicUrl} alt="Player" className="h-9 w-9 rounded-full border-2 border-brand-green object-cover flex-shrink-0"/>
                      <span className="text-sm font-medium text-light-1 truncate">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isUserAdmin && (
                      <button 
                        onClick={() => { onSetIsAdminView(!isAdminView); handleMobileNav('home'); }} 
                        className="btn !px-3 !py-2 bg-brand-yellow text-dark-1 text-xs"
                      >
                        {isAdminView ? 'Exit' : 'Admin'}
                      </button>
                    )}
                    <button onClick={toggleTheme} className="text-light-2 p-2 rounded-full hover:bg-white/10" aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>
                    <button onClick={signOut} className="text-light-2 p-2 rounded-full hover:bg-white/10" aria-label="Sign Out">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                    </button>
                  </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Header;
