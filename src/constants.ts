

import { Tournament, Player, LeaderboardEntry, Game } from './types';

export const ANONYMOUS_PLAYER: Player = {
  id: 'anonymous_user',
  name: 'Guest Player',
  email: '',
  freeFireId: 'N/A',
  phone: 'N/A',
  profilePicUrl: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=guest`,
  isAnonymous: true,
  isAdmin: false
};

// Mock data for games on the home page
export const MOCK_GAMES: Game[] = [
  { id: 1, title: 'The Hunter Killer', imageUrl: 'https://placehold.co/400x500/121415/96F01D?text=Hunter+Killer', entryFee: '৳100' },
  { id: 2, title: 'Net Remaining Monies', imageUrl: 'https://placehold.co/400x500/121415/E5A83D?text=Monies', entryFee: 'Free' },
  { id: 3, title: 'duty Balck Ops', imageUrl: 'https://placehold.co/400x500/121415/3357ff?text=Balck+Ops', entryFee: '৳100' },
  { id: 4, title: 'League of Legends', imageUrl: 'https://placehold.co/400x500/121415/ff33a1?text=LoL', entryFee: '৳100' },
];


// Mock data can be used as a fallback if Supabase fails
export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: 'Pro Player VS Lion King',
    date: 'July 30, 2024',
    time: '8:00 PM',
    entry_fee: 100,
    prize_pool: 5000,
    status: 'Upcoming',
    room_id: null,
    room_password: null,
    banner_image_url: 'https://placehold.co/1280x400/08090A/96F01D/png?text=NKG+Esports',
    map: 'Bermuda',
    per_kill_prize: 20,
    spots_filled: 30,
    total_spots: 50,
    type: 'Squad',
    version: 'TPP',
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    name: 'Shadow Gamers VS Inferno Squad',
    date: 'August 5, 2024',
    time: '9:00 PM',
    entry_fee: 200,
    prize_pool: 10000,
    status: 'Finished',
    room_id: null,
    room_password: null,
    banner_image_url: 'https://placehold.co/1280x400/08090A/E5A83D/png?text=NKG+Esports',
    map: 'Kalahari',
    per_kill_prize: 50,
    spots_filled: 48,
    total_spots: 48,
    type: 'Squad',
    version: 'TPP',
  },
  {
    id: 3,
    created_at: new Date().toISOString(),
    name: 'Cyber Warriors VS Tech Titans',
    date: 'August 1, 2024',
    time: '6:00 PM',
    entry_fee: 0,
    prize_pool: 1000,
    status: 'Ongoing',
    room_id: 'C-101',
    room_password: 'go',
    banner_image_url: 'https://placehold.co/1280x400/08090A/FFFFFF/png?text=NKG+Esports',
    map: 'Purgatory',
    per_kill_prize: 10,
    spots_filled: 12,
    total_spots: 50,
    type: 'Solo',
    version: 'FPP',
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 1, rank: 1, player_name: 'Max Alexis', winnings: 25000, profile_pic_url: 'https://placehold.co/300/400/E5A83D/08090A?text=Max' },
  { id: 2, rank: 2, player_name: 'William Lili', winnings: 22000, profile_pic_url: 'https://placehold.co/300/400/ec4899/08090A?text=William' },
  { id: 3, rank: 3, player_name: 'Mac Marsh', winnings: 18000, profile_pic_url: 'https://placehold.co/300/400/96F01D/08090A?text=Mac' },
  { id: 4, rank: 4, player_name: 'Eva Raina', winnings: 15000, profile_pic_url: 'https://placehold.co/300/400/38bdf8/08090A?text=Eva' },
  { id: 5, rank: 5, player_name: 'Robin Cloth', winnings: 12000, profile_pic_url: 'https://placehold.co/300/400/f87171/08090A?text=Robin' },
];


export const AI_SYSTEM_INSTRUCTION = `You are the NKG Esports assistant.

Your primary functions are:
1.  **Answer FAQs:** Provide clear and concise answers to questions about tournament rules, schedules, and formats.
2.  **Explain Payments:** Guide users on how to pay the entry fee using bKash.
3.  **Explain Rules:** Detail the general rules and regulations of the tournaments.

**Key Information to Use:**
*   **Payment Method:** bKash is the only payment method. Users must send money to the official NKG bKash number (which you should state as "the official number provided on the payment page") and then submit a form with their bKash number, the last 4 digits of the transaction, and a screenshot of the payment confirmation.
*   **Approval:** Registrations are manually approved by an admin after payment verification. The status will change from "Pending" to "Approved".
*   **Support:** For complex issues, direct users to the official WhatsApp support channel.
*   **Tone:** Be friendly, encouraging, and clear. Use emojis where appropriate.

**Example Interactions:**

*   **User:** "How do I join a tournament?"
    *   **You:** "Great question! To join, go to the 'Tournaments' page, pick one you like, and click it to see the details. If it's an upcoming tournament, you'll find a 'Join' button there! You'll need to sign in, fill out a form with your game details and payment info. It's super easy! 🎮"
*   **User:** "Payment kivabe korbo?" (How do I make a payment?)
    *   **You:** "Payment is simple! You need to use bKash Send Money to our official number. After paying, just fill out the registration form with your bKash details and upload a screenshot of the payment. An admin will then approve your spot! 👍"
*   **User:** "What are the rules?"
    *   **You:** "The general rules are: no hacking or cheating, no teaming up with opponents (unless it's a team event), and always show good sportsmanship. Specific rules for each tournament can be found on the tournament details page. Good luck! 🏆"

Always be helpful and promote a positive gaming environment. Do not provide information outside of NKG Esports topics.
`;