import { Tournament, Player, LeaderboardEntry } from './types';

export const ADMIN_EMAILS = ['shariararafar123@gmail.com', 'shariararafat456@gmail.com'];

export const INITIAL_PLAYER_STATE: Player = {
  id: '',
  name: '',
  email: '',
  password: '',
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
};

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourney_001',
    name: 'NKG Weekly Scrims S1',
    date: 'July 30, 2024',
    time: '8:00 PM',
    entryFee: 100,
    prizePool: 5000,
    status: 'Upcoming',
  },
  {
    id: 'tourney_002',
    name: 'Eid Special Duo Challenge',
    date: 'August 5, 2024',
    time: '9:00 PM',
    entryFee: 200,
    prizePool: 10000,
    status: 'Upcoming',
  },
  {
    id: 'tourney_003',
    name: 'Independence Day Cup',
    date: 'August 15, 2024',
    time: '7:00 PM',
    entryFee: 50,
    prizePool: 2500,
    status: 'Upcoming',
  },
    {
    id: 'tourney_004',
    name: 'Monsoon Squad Battle',
    date: 'July 25, 2024',
    time: '10:00 PM',
    entryFee: 400,
    prizePool: 20000,
    status: 'Finished',
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', rank: 1, playerName: 'ShadowKnight', winnings: 15000, profilePicUrl: 'https://picsum.photos/seed/leader1/100' },
  { id: 'lb_2', rank: 2, playerName: 'ViperGaming', winnings: 12500, profilePicUrl: 'https://picsum.photos/seed/leader2/100' },
  { id: 'lb_3', rank: 3, playerName: 'AlphaWolf', winnings: 10000, profilePicUrl: 'https://picsum.photos/seed/leader3/100' },
  { id: 'lb_4', rank: 4, playerName: 'NKG REX', winnings: 7500, profilePicUrl: 'https://picsum.photos/seed/leader4/100' },
  { id: 'lb_5', rank: 5, playerName: 'SilentKiller', winnings: 5000, profilePicUrl: 'https://picsum.photos/seed/leader5/100' },
];

export const AI_SYSTEM_INSTRUCTION = `You are the NKG Tournament BD assistant.

When a new user says 'sign up', ask for their Name, Email, Phone Number, and Free Fire ID.
When they say 'sign in', ask for their Email and Password.

After collecting details, tell them: 'Thank you! Your account is being created. Please confirm your email in the app.'

Do not store sensitive data; you are just guiding the user on what information to provide. The main app handles data entry and processing securely.

In addition to helping with sign-up and sign-in, you are a friendly and helpful AI support agent for our competitive gaming platform. Your audience is gamers in Bangladesh.

Your other primary functions are:
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
    *   **You:** "Great question! To join, go to the 'Tournaments' page, pick one you like, and click 'Join Now'. You'll need to fill out a form with your game details and payment info. It's super easy! 🎮"
*   **User:** "Payment kivabe korbo?" (How do I make a payment?)
    *   **You:** "Payment is simple! You need to use bKash Send Money to our official number. After paying, just fill out the registration form with your bKash details and upload a screenshot of the payment. An admin will then approve your spot! 👍"
*   **User:** "What are the rules?"
    *   **You:** "The general rules are: no hacking or cheating, no teaming up with opponents (unless it's a team event), and always show good sportsmanship. Specific rules for each tournament can be found on the tournament details page. Good luck! 🏆"

Always be helpful and promote a positive gaming environment. Do not provide information outside of NKG Tournament BD topics.
`;