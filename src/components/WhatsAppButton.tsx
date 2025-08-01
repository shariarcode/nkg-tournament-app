import React from 'react';

const WhatsAppIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
        <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm7.5 18.4a2.3 2.3 0 0 1-1.2.8 10.3 10.3 0 0 1-5.1-1.5A12.4 12.4 0 0 1 11 13.5a9.7 9.7 0 0 1-1.4-4.6 2.3 2.3 0 0 1 .8-1.5 1 1 0 0 1 .7-.3h.2l.5.1a14.7 14.7 0 0 1 1.2 1.2c.4.5.6 1 .7 1.2s.1.6 0 .9l-.3.6a.7.7 0 0 1-.5.3l-.3.1-.2.1a1 1 0 0 0-.6.9 4.3 4.3 0 0 0 1.2 2.3 5.4 5.4 0 0 0 2.5 1.5 1.5 1.5 0 0 0 1-.2l.3-.2a.9.9 0 0 1 .7-.2l.6.1c.3 0 .7.1 1.2.5s.8.9 1 1.2.3.6.2.9-.2.5-.4.7Z"/>
    </svg>
);


const WhatsAppButton: React.FC = () => {
    // Replace with actual WhatsApp number
    const WHATSAPP_NUMBER = "8801301440744";
    const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

    return (
        <a 
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 left-5 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform hover:scale-110"
            aria-label="Contact on WhatsApp"
        >
            <WhatsAppIcon className="h-8 w-8"/>
        </a>
    );
};

export default WhatsAppButton;