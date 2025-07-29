import { Tournament, Player, LeaderboardEntry } from './types';

export const INITIAL_PLAYER_STATE: Player = {
  id: '',
  name: '',
  email: '',
  freeFireId: '',
  phone: '',
  profilePicUrl: ''
};

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

// Mock data can be used as a fallback if Supabase fails
export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: 'NKG Weekly Scrims S1',
    date: 'July 30, 2024',
    time: '8:00 PM',
    entry_fee: 100,
    prize_pool: 5000,
    status: 'Upcoming',
    room_id: null,
    room_password: null,
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    name: 'Eid Special Duo Challenge',
    date: 'August 5, 2024',
    time: '9:00 PM',
    entry_fee: 200,
    prize_pool: 10000,
    status: 'Upcoming',
    room_id: null,
    room_password: null,
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 1, rank: 1, player_name: 'ShadowKnight', winnings: 15000, profile_pic_url: 'https://picsum.photos/seed/leader1/100' },
  { id: 2, rank: 2, player_name: 'ViperGaming', winnings: 12500, profile_pic_url: 'https://picsum.photos/seed/leader2/100' },
];


export const AI_SYSTEM_INSTRUCTION = `You are the NKG Tournament BD assistant.

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
    *   **You:** "Great question! To join, go to the 'Tournaments' page, pick one you like, and click 'Join Now'. You'll need to sign in, fill out a form with your game details and payment info. It's super easy! 🎮"
*   **User:** "Payment kivabe korbo?" (How do I make a payment?)
    *   **You:** "Payment is simple! You need to use bKash Send Money to our official number. After paying, just fill out the registration form with your bKash details and upload a screenshot of the payment. An admin will then approve your spot! 👍"
*   **User:** "What are the rules?"
    *   **You:** "The general rules are: no hacking or cheating, no teaming up with opponents (unless it's a team event), and always show good sportsmanship. Specific rules for each tournament can be found on the tournament details page. Good luck! 🏆"

Always be helpful and promote a positive gaming environment. Do not provide information outside of NKG Tournament BD topics.
`;
