export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    mail?: string;
  };
  specialties: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image?: string;
  video?: string;
  audiourl?: string; // Podcast/Audio support
  gallery?: string[]; // Multiple photos
  author: string;
  authorrole?: string;
  excerpt: string;
  content: string;
  readingtime: string;
  imagecredit?: string;
  source?: string;
  views: number;
  likes: number;
  reactions?: Record<string, number>; // Emoji reactions
  commentscount?: number;
  tags?: string[];
  status: 'draft' | 'published';
  ispremium?: boolean;
  premiumpreviewselection?: 'auto' | 'manual';
  manualpreview?: string;
  scheduledat?: string;
  // SEO & Social
  seotitle?: string;
  seodescription?: string;
  socialimage?: string;
}

export interface Comment {
  id: string;
  userid?: string;
  userphoto?: string;
  username: string;
  date: string;
  content: string;
  likes: number;
  likedby?: string[]; // Array of user IDs who liked
  articleid: string;
  parentid?: string; // For replies
  reportedby?: string[]; // Array of user IDs who reported
  isreported?: boolean;
  isadmin?: boolean;
}

export interface UserProfile {
  uid: string;
  displayname: string;
  username: string;
  email: string;
  photourl: string;
  cover_image?: string;
  role: 'user' | 'editor' | 'admin';
  bio?: string;
  phone?: string;
  phone_verified: boolean;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  kyc_level: number;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected' | 'expired';
  kyc_documents?: any[];
  kyc_rejection_reason?: string;
  two_factor_enabled: boolean;
  two_factor_method?: 'sms' | 'email' | 'totp';
  pin_code?: string;
  language: string;
  currency: string;
  timezone?: string;
  font_size: 'small' | 'normal' | 'large';
  accessibility?: {
    colorBlindMode: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  notification_preferences?: {
    push: Record<string, boolean>;
    email: Record<string, boolean>;
    sms: Record<string, boolean>;
  };
  privacy_settings?: {
    profile: 'public' | 'private' | 'friends';
    status: boolean;
    readingHistory: boolean;
    followers: boolean;
    following: boolean;
    messages: 'all' | 'followers' | 'none';
  };
  blocked_users: string[];
  muted_keywords: string[];
  referral_code?: string;
  referred_by?: string;
  streak_days: number;
  last_active_date?: string;
  secondary_email?: string;
  website_url?: string;
  read_count?: number;
  loyalty_points?: number;
  theme?: 'light' | 'dark' | 'system';
  likedarticles: string[];
  bookmarkedarticles: string[];
  followedauthors: string[];
  followedcategories: string[];
  interests: string[];
  votedpolls: string[];
  badges: string[];
  points: number;
  ispremium?: boolean;
  premiumsince?: string;
  premiumuntil?: string; // ISO date string
  paymentmethod?: string;
  history?: { articleid: string; date: string }[];
  dashboard_preferences?: {
    theme: 'light' | 'dark' | 'system';
    sidebar_collapsed: boolean;
    compact_view: boolean;
    default_tab: string;
  };
  notifications_sound?: boolean;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface CulturePost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: 'patrimoine' | 'traditions' | 'personnages' | 'civilisations' | 'art' | 'musique' | 'gastronomie' | 'langues';
  image?: string;
  video?: string;
  gallery?: string[];
  excerpt: string;
  content: string;
  author: string;
  period: string; // ex: "XVIe siècle"
  region: string; // ex: "Afrique de l'Ouest"
  readingtime: string;
  views: number;
  likes: number;
  status: 'draft' | 'published';
  createdat: string;
}

export interface ChatMessage {
  id: string;
  articleid: string;
  userid: string;
  username: string;
  userphoto?: string;
  content: string;
  date: string;
  isadmin?: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  category: string;
  image?: string;
  imagecredit?: string;
  gallery?: string[];
  video?: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  scheduledat?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  startdate: string;
  enddate?: string;
  active: boolean;
}

export interface SiteSettings {
  abouttext: string;
  email: string;
  phone: string;
  address: string;
  facebookurl?: string;
  twitterurl?: string;
  instagramurl?: string;
  tiktokurl?: string;
  linkedinurl?: string;
  youtubeurl?: string;
  // Ads
  adslotheader?: string;
  adslotsidebar?: string;
  adslotfooter?: string;
  // Breaking News
  urgentbannertext?: string;
  urgentbanneractive?: boolean;
  urgentbannerlink?: string;
  flashnews?: string; // Semicolon separated news for ticker
  // Categories
  categories: string[];
  categories_icons?: Record<string, string>;
  // Maintenance
  maintenancemode: boolean;
  // Donations & Premium
  donationamounts: number[];
  donationpaymentmethods: string[];
  premiumprice: number;
  isdonationactive: boolean;
  ispremiumactive: boolean;
  activepaymentmethods: {
    paypal?: boolean;
    stripe?: boolean;
    flutterwave?: boolean;
    orangeMoney?: boolean;
    mtn?: boolean;
    moov?: boolean;
    wave?: boolean;
  };
  paymentlinks?: {
    paypal?: string;
    stripe?: string;
    flutterwave?: string;
    orangeMoney?: string;
    mtn?: string;
    moov?: string;
    wave?: string;
  };
  premiumdurationmonths?: number;
  orangemoneynumber?: string;
  mtnmoneynumber?: string;
  moovmoneynumber?: string;
  wavenumber?: string;
  paypalid?: string;
  stripepublickey?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  date: string;
  filename?: string;
}

export interface LiveBlog {
  id: string;
  articleid: string; // Linked to article if it's a "Live" article
  title: string;
  updates: LiveUpdate[];
  status: 'live' | 'ended';
  createdat: string;
}

export interface LiveUpdate {
  id: string;
  content: string;
  date: string;
  type: 'info' | 'urgent' | 'media';
  imageurl?: string;
  videourl?: string;
  author: string;
}

export interface WebTV {
  id: string;
  title: string;
  description: string;
  videourl: string;
  thumbnail: string;
  category: string;
  date: string;
  views: number;
  ispremium?: boolean;
}

export interface Classified {
  id: string;
  title: string;
  description: string;
  price?: string;
  category: 'emploi' | 'immobilier' | 'véhicules' | 'services' | 'divers';
  location: string;
  contact: string;
  imageurl?: string;
  userid: string;
  username: string;
  date: string;
  status: 'active' | 'sold' | 'expired';
}

export interface SiteStats {
  views: number;
}

export interface AppNotification {
  id: string;
  userid?: string;
  topic?: string;
  title: string;
  message: string;
  link?: string;
  date: string;
  read: boolean;
  type: 'article' | 'event' | 'urgent' | 'system';
}

export interface HistoryEvent {
  id: string;
  date: string;
  year: number;
  title: string;
  content: string;
  category: string;
  image?: string;
}

export interface MapPoint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'culture' | 'history' | 'nature' | 'monument';
  country: string;
  image?: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DiasporaStory {
  id: string;
  name: string;
  story: string;
  location: string;
  category: string;
  date: string;
  image?: string;
  isFeatured?: boolean;
}

export interface Transaction {
  id: string;
  userid: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  paymentmethod: string;
  reference: string;
  date: string;
}

export interface SupportMessage {
  id: string;
  userid: string;
  username: string;
  userphoto?: string;
  content: string;
  date: string;
  isadmin: boolean;
}
