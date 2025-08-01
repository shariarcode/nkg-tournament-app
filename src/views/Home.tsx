import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import NoticeBanner from '../components/NoticeBanner';
import { TrophyIcon } from '../components/Icons';

const Home: React.FC = () => {
  const { navigate } = useContext(AppContext) as AppContextType;

  return (
    <div className="space-y-8">
      <NoticeBanner />
      
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Welcome to <span className="text-red-500">NKG Tournament BD</span>
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          The ultimate destination for competitive gamers in Bangladesh. Join tournaments, climb the leaderboard, and prove you're the best.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('tournaments')}
          className="bg-red-600 text-white font-bold py-4 px-10 rounded-lg text-xl flex items-center space-x-3 transition-transform duration-300 hover:scale-105 hover:bg-red-700 shadow-lg shadow-red-500/30"
        >
          <TrophyIcon className="h-7 w-7" />
          <span>Join a Tournament</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-red-500 mb-3">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Browse upcoming tournaments.</li>
                <li>Click "Join Now" and fill out your details.</li>
                <li>Pay the entry fee via bKash.</li>
                <li>Upload your payment screenshot.</li>
                <li>Wait for admin approval and get ready to play!</li>
            </ol>
        </div>
         <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-red-500 mb-3">Need Help?</h2>
            <p className="text-gray-300 mb-4">
              Have questions about rules, payments, or anything else? Our AI Assistant and support team are here for you.
            </p>
            <div className="flex space-x-4">
                <p className="flex-1 text-center py-3 px-4 bg-gray-700 rounded-lg">Use the <span className="font-bold">AI Chat</span> for quick answers.</p>
                <p className="flex-1 text-center py-3 px-4 bg-gray-700 rounded-lg">Contact <span className="font-bold">WhatsApp Support</span> for direct help.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;