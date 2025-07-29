import React, { useState, useContext, useRef } from 'react';
import { Tournament, Registration } from '../types';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { XMarkIcon, ArrowUpTrayIcon } from './Icons';
import { supabase } from '../services/supabase';
import type { Database } from '../services/database.types';

interface JoinTournamentModalProps {
  tournament: Tournament | null;
  onClose: () => void;
}

type RegistrationInsert = Database['public']['Tables']['registrations']['Insert'];

const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({ tournament, onClose }) => {
  const { player, setRegistrations } = useContext(AppContext) as AppContextType;
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashLast4, setBkashLast4] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !screenshotFile || !player || player.isAnonymous) {
      alert("Please fill all fields and upload a screenshot.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload screenshot to Supabase Storage
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${player.id}-${Date.now()}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, screenshotFile);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);
      
      if (!urlData) throw new Error("Could not get public URL for screenshot");

      // 3. Insert registration into the database
      const newRegistration: RegistrationInsert = {
        player_id: player.id,
        tournament_id: tournament.id,
        bkash_number: bkashNumber,
        bkash_last4: bkashLast4,
        payment_screenshot_url: urlData.publicUrl,
        status: 'Pending',
      };

      const { data: regData, error: insertError } = await supabase
        .from('registrations')
        .insert(newRegistration)
        .select('*, tournaments(name)')
        .single();
      
      if (insertError) throw insertError;
      
      if (regData) {
        const newRegWithTournamentName: Registration = { 
            ...regData, 
            tournamentName: regData.tournaments?.name || 'N/A' 
        };
        setRegistrations(prev => [...prev, newRegWithTournamentName]);
      }

      alert('Thank you for your submission! Please wait for admin approval.');
      onClose();

    } catch (error: any) {
        console.error("Error submitting registration:", error);
        alert(`Failed to submit registration: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!tournament) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Join: <span className="text-red-500">{tournament.name}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Player Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Player Information</h3>
              <div className="bg-gray-900/50 p-4 rounded-lg space-y-2">
                <p><strong>Name:</strong> {player.name}</p>
                <p><strong>Free Fire ID:</strong> {player.freeFireId}</p>
                <p><strong>Phone:</strong> {player.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Payment Details</h3>
              <p className="text-sm text-yellow-400 mb-4 bg-yellow-900/50 p-3 rounded-lg">Pay <strong className="text-white">{tournament.entry_fee} BDT</strong> to our bKash number: <strong className="text-white">01301440744</strong> (Send Money), then fill the form below.</p>
              <div className="space-y-4">
                 <input type="tel" placeholder="Your bKash Number" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                 <input type="tel" placeholder="Last 4 Digits of Transaction ID" value={bkashLast4} onChange={(e) => setBkashLast4(e.target.value)} maxLength={4} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            
            {/* Screenshot Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Upload Payment Screenshot</h3>
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" required className="hidden" />
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Payment Preview" className="max-h-40 mx-auto rounded-lg" />
                ) : (
                  <div className="text-gray-400">
                    <ArrowUpTrayIcon className="h-12 w-12 mx-auto mb-2 text-gray-500"/>
                    <p>Click to upload</p>
                    <p className="text-xs">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 border-t border-gray-700">
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-wait">
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinTournamentModal;