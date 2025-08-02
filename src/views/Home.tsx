import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { ArrowRightIcon, PlusIcon } from '../components/Icons';
import { MOCK_GAMES } from '../constants';

const Home: React.FC = () => {
  const { navigate } = useContext(AppContext) as AppContextType;

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Hero Section */}
      <div className="text-center relative pt-10">
        <p className="text-brand-green font-display tracking-widest mb-4"># World Class eSports & Gaming Site</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display leading-tight">
          SHAPING THE FUTURE OF <br/>
          <span className="text-brand-green">ESPORTS</span>
        </h1>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => navigate('tournaments')} className="btn btn-primary">
            Explore More <ArrowRightIcon className="w-4 h-4"/>
          </button>
          <button onClick={() => navigate('tournaments')} className="btn btn-secondary">
            Browse Games <ArrowRightIcon className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-dark-2 py-6 border-y-2 border-brand-green">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-around items-center gap-4 text-white font-display text-lg tracking-wider">
            <div className="flex items-center gap-3"><PlusIcon className="w-4 h-4 text-brand-green"/><span>GAMING SPANING</span></div>
            <div className="flex items-center gap-3"><PlusIcon className="w-4 h-4 text-brand-green"/><span>ACTION - PACKED</span></div>
            <div className="flex items-center gap-3"><PlusIcon className="w-4 h-4 text-brand-green"/><span>MIND - BENDING</span></div>
            <div className="flex items-center gap-3"><PlusIcon className="w-4 h-4 text-brand-green"/><span>COLLECTION OG GAMES</span></div>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src="https://placehold.co/600x600/121415/96F01D?text=Bame" alt="Forging Legends" className="rounded-2xl" />
        </div>
        <div className="space-y-6">
          <p className="text-brand-green font-display tracking-widest"># About Our Gaming Site</p>
          <h2 className="text-4xl md:text-5xl">Forging Legends In The Gaming Universe</h2>
          <div className="space-y-4 font-sans text-light-2">
            <p>We are dedicated to creating a vibrant and competitive ecosystem for gamers of all levels. From grassroots tournaments to professional leagues, we provide the platform for players to showcase their skills, connect with the community, and forge their own legacy.</p>
            <p>Our state-of-the-art platform ensures fair play, seamless organization, and an electrifying experience for both participants and spectators.</p>
          </div>
          <button onClick={() => navigate('tournaments')} className="btn btn-primary mt-4">
            Join Tournament <ArrowRightIcon className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Games Section */}
      <div>
        <div className="text-center mb-12">
            <p className="text-brand-green font-display tracking-widest"># Releases The Latest Game</p>
            <h2 className="text-4xl md:text-5xl">Game On, Power Up, Win Big!</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_GAMES.map(game => (
            <div key={game.id} className="group rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-brand-green hover:-translate-y-2">
              <img src={game.imageUrl} alt={game.title} className="w-full h-auto object-cover" />
              <div className="p-4 bg-dark-2">
                <h4 className="text-xl text-white group-hover:text-brand-green transition-colors">{game.title}</h4>
                <p className="font-sans text-sm text-light-2">Entry Fee: <span className="text-white font-semibold">{game.entryFee}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
