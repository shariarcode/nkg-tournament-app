import React, { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { YoutubeIcon, FacebookIcon } from '../components/Icons';

// Helper to extract YouTube video ID from various URL formats
const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
        let videoId = '';
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1).split('?')[0];
        } else if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.includes('/embed/')) {
                 videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
            } else {
                 videoId = urlObj.searchParams.get('v') || '';
            }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : null;
    } catch(e) {
        console.error("Invalid YouTube URL:", url, e);
        return null;
    }
};


// Helper to create Facebook embed URL
const getFacebookEmbedUrl = (url: string): string | null => {
    if (!url || !url.includes('facebook.com')) return null;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=734&autoplay=1&mute=1`;
};

const LiveStreamEmbed: React.FC<{ title: string; embedUrl: string; icon: React.ReactNode }> = ({ title, embedUrl, icon }) => (
    <div className="bg-dark-2 p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
                src={embedUrl}
                title={`${title} Live Stream`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    </div>
);


const Live: React.FC = () => {
    const { siteContent } = useContext(AppContext) as AppContextType;

    const youtubeUrl = getYoutubeEmbedUrl(siteContent.youtube_live_url || '');
    const facebookUrl = getFacebookEmbedUrl(siteContent.facebook_live_url || '');

    const hasLiveStreams = youtubeUrl || facebookUrl;

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up">
            <div className="text-center">
                <p className="text-brand-green font-display tracking-widest"># WATCH US LIVE</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Live Broadcast</h1>
            </div>

            {hasLiveStreams ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {youtubeUrl && (
                        <LiveStreamEmbed 
                            title="YouTube Live" 
                            embedUrl={youtubeUrl} 
                            icon={<YoutubeIcon className="w-8 h-8 text-red-600"/>} 
                        />
                    )}
                    {facebookUrl && (
                        <LiveStreamEmbed 
                            title="Facebook Live" 
                            embedUrl={facebookUrl} 
                            icon={<FacebookIcon className="w-8 h-8 text-blue-500"/>}
                        />
                    )}
                </div>
            ) : (
                <div className="text-center bg-dark-2 p-12 rounded-xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white">No Live Streams Available</h2>
                    <p className="text-light-2 mt-2 font-sans">Check back later for live tournament action!</p>
                </div>
            )}
        </div>
    );
};

export default Live;
