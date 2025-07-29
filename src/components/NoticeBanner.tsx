import React, { useState, useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';

const NoticeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { notice } = useContext(AppContext) as AppContextType;

  if (!isVisible || !notice) return null;

  return (
    <div className="bg-red-600 text-white p-3 rounded-lg shadow-lg flex justify-between items-center mb-8 animate-fade-in-down">
      <p className="font-semibold text-center flex-grow">{notice}</p>
      <button onClick={() => setIsVisible(false)} className="text-white hover:bg-red-700 p-1 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default NoticeBanner;
