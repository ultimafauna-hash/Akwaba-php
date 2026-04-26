import { 
  Author, Article, Comment, UserProfile, AdminActivityLog, 
  CulturePost, Event, Poll, SiteSettings, Subscriber, 
  MediaAsset, LiveBlog, LiveUpdate, WebTV, Classified, AppNotification,
  HistoryEvent, MapPoint, Quiz, DiasporaStory, Transaction, SupportMessage, ChatMessage
} from '../types';

const API_URL = '/api';

// Helper for tokens
function getToken(): string | null { return sessionStorage.getItem('akwaba_token'); }
function setToken(token: string): void { sessionStorage.setItem('akwaba_token', token); }
function removeToken(): void { sessionStorage.removeItem('akwaba_token'); }

// State management for auth changes (mock of Firebase/Supabase behavior)
type AuthListener = (user: any | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function onAuthStateChanged(callback: AuthListener) {
  authListeners.add(callback);
  // Initial call - we don't auto-fetch anymore to avoid automatic connection
  // User starts as null/visitor by default
  callback(null);
  return () => authListeners.delete(callback);
}

function notifyAuthChange(user: any | null) {
  authListeners.forEach(listener => listener(user));
}

// Global fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: any = { ...(options.headers || {}) };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    removeToken();
    notifyAuthChange(null);
  }

  const result = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(result.error || 'Erreur serveur');
  }
  
  return result;
}

// Utility to normalize user data
function normalizeUser(user: any) {
  if (!user) return null;
  return {
    uid: user.id || user.uid,
    email: user.email,
    displayname: user.displayname,
    role: user.role
  };
}

export const api = {
  // Auth
  getToken,
  async register(data: any) {
    const res = await apiFetch('/auth.php?action=register', { method: 'POST', body: JSON.stringify(data) });
    setToken(res.token);
    notifyAuthChange(res.user);
    return res;
  },
  async login(data: any) {
    const res = await apiFetch('/auth.php?action=login', { method: 'POST', body: JSON.stringify(data) });
    setToken(res.token);
    notifyAuthChange(res.user);
    return res;
  },
  async adminLogin(data: any) {
    const res = await apiFetch('/auth.php?action=admin-login', { method: 'POST', body: JSON.stringify(data) });
    setToken(res.token);
    notifyAuthChange(res.user);
    return res;
  },
  async loginWithOtp(email: string) {
    return apiFetch('/auth.php?action=magiclink', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async sendMagicLink(email: string) {
    return apiFetch('/auth.php?action=magiclink', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async resetPassword(email: string) {
    return apiFetch('/auth.php?action=forgot', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async logout() {
    await apiFetch('/auth?action=logout', { method: 'POST' });
    removeToken();
    notifyAuthChange(null);
  },
  async getMe() {
    try {
      const user = await apiFetch('/auth?action=me');
      return normalizeUser(user);
    } catch {
      return null;
    }
  },

  // Articles
  async getArticles(category?: string, search?: string): Promise<Article[]> {
    let url = '/articles.php';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString();
    return apiFetch(qs ? `${url}?${qs}` : url);
  },
  async getArticleBySlug(slug: string): Promise<Article> {
    return apiFetch(`/articles.php?slug=${slug}`);
  },
  async saveArticle(article: Article): Promise<any> {
    return apiFetch('/articles.php', { method: 'POST', body: JSON.stringify(article) });
  },
  async deleteArticle(id: string): Promise<any> {
    return apiFetch(`/articles.php?id=${id}`, { method: 'DELETE' });
  },
  async incrementArticleViews(id: string): Promise<void> {
    await apiFetch('/articles.php?action=view', { method: 'POST', body: JSON.stringify({ id }) });
  },
  subscribeToArticles(callback: (article: Article) => void) {
    const interval = setInterval(async () => {
      try {
        const articles = await this.getArticles();
        if (articles && articles.length > 0) {
          callback(articles[0]); // Just mock passing latest
        }
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  },
  async likeArticle(id: string): Promise<void> {
    await apiFetch('/articles.php?action=like', { method: 'POST', body: JSON.stringify({ id }) });
  },

  // Profile
  async getProfile(uid?: string): Promise<UserProfile> {
    return apiFetch(uid ? `/profile.php?uid=${uid}` : '/profile.php');
  },
  async getUserProfile(uid: string): Promise<UserProfile> {
    return apiFetch(`/profile.php?uid=${uid}`);
  },
  async updateProfile(data: Partial<UserProfile>): Promise<any> {
    return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<any> {
    return apiFetch(`/profile.php?uid=${uid}`, { method: 'POST', body: JSON.stringify(data) });
  },
  async bookmarkArticle(articleid: string): Promise<any> {
    return apiFetch('/profile.php?action=bookmark', { method: 'POST', body: JSON.stringify({ articleid }) });
  },
  async followAuthor(authorId: string, userId: string, isFollowing?: boolean) {
    return this.post('/profile.php?action=followAuthor', { userId, authorId, follow: isFollowing });
  },
  async followCategory(category: string, userId: string, isFollowing?: boolean) {
    return this.post('/profile.php?action=followCategory', { userId, category, follow: isFollowing });
  },
  async updateUserPoints(userId: string, points: number) {
    return this.put('/profile.php?action=points', { userId, points });
  },
  // Profile & Security
  async updatePassword(password: string) { return apiFetch('/auth.php', { method: 'POST', body: JSON.stringify({ action: 'password', password }) }); },
  async updateUserEmail(email: string) { return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify({ action: 'email', email }) }); },
  async setPIN(uid: string, pin: string) { return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify({ action: 'pin', pin }) }); },
  async submitKYCDocuments(uid: string, documents: any[]) { return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify({ action: 'kyc', documents }) }); },
  async notifyAdminKYC(uid: string, name: string) { 
    return apiFetch('/notifications.php', { 
      method: 'POST', 
      body: JSON.stringify({ 
        type: 'kyc_request', 
        userid: 'admin', 
        title: 'Nouveau KYC', 
        message: `KYC à valider pour ${name}` 
      }) 
    }); 
  },
  async enrollMFA() { return { qrCode: "MOCK_QR_CODE", id: "MOCK_MFA_ID" }; },
  async verifyMFA(id: string, code: string) { return { success: true }; },
  async enable2FA(uid: string, method: string) { return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify({ action: 'enable2fa', method }) }); },
  async disable2FA(uid: string) { return apiFetch('/profile.php', { method: 'POST', body: JSON.stringify({ action: 'disable2fa' }) }); },
  async awardPoints(points: number) {
    return this.post('/profile.php?action=awardPoints', { points });
  },

  // Comments
  async getComments(articleid: string): Promise<Comment[]> {
    return apiFetch(`/comments.php?articleid=${articleid}`);
  },
  async getAllComments(): Promise<Comment[]> {
    return apiFetch('/comments.php');
  },
  async saveComment(comment: Partial<Comment>): Promise<any> {
    return apiFetch('/comments.php', { method: 'POST', body: JSON.stringify(comment) });
  },
  async deleteComment(id: string): Promise<any> {
    return apiFetch(`/comments.php?id=${id}`, { method: 'DELETE' });
  },
  async likeComment(id: string): Promise<void> {
    await apiFetch('/comments.php?action=like', { method: 'POST', body: JSON.stringify({ id }) });
  },
  async reportComment(id: string): Promise<void> {
    await apiFetch('/comments.php?action=report', { method: 'POST', body: JSON.stringify({ id }) });
  },

  // Events
  async getEvents(): Promise<Event[]> {
    return apiFetch('/events.php');
  },
  async saveEvent(event: Partial<Event>): Promise<any> {
    return apiFetch('/events.php', { method: 'POST', body: JSON.stringify(event) });
  },
  async deleteEvent(id: string): Promise<any> {
    return apiFetch(`/events.php?id=${id}`, { method: 'DELETE' });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return apiFetch('/settings.php');
  },
  async saveSettings(settings: Partial<SiteSettings>): Promise<any> {
    return apiFetch('/settings.php', { method: 'POST', body: JSON.stringify(settings) });
  },

  // Polls
  async getPolls(): Promise<Poll[]> {
    return apiFetch('/polls.php');
  },
  async savePoll(poll: Partial<Poll>): Promise<any> {
    return apiFetch('/polls.php', { method: 'POST', body: JSON.stringify(poll) });
  },
  async deletePoll(id: string): Promise<any> {
    return apiFetch(`/polls.php?id=${id}`, { method: 'DELETE' });
  },
  async submitVote(pollid: string, optionid: string): Promise<void> {
    await apiFetch('/polls.php?action=vote', { method: 'POST', body: JSON.stringify({ pollid, optionid }) });
  },

  // Culture
  async getCulturePosts(): Promise<CulturePost[]> {
    return apiFetch('/culture.php');
  },
  async saveCulturePost(post: Partial<CulturePost>): Promise<any> {
    return apiFetch('/culture.php', { method: 'POST', body: JSON.stringify(post) });
  },
  async deleteCulturePost(id: string): Promise<any> {
    return apiFetch(`/culture.php?id=${id}`, { method: 'DELETE' });
  },

  // WebTV
  async getWebTV(): Promise<WebTV[]> {
    return apiFetch('/webtv.php');
  },
  async saveWebTV(video: Partial<WebTV>): Promise<any> {
    return apiFetch('/webtv.php', { method: 'POST', body: JSON.stringify(video) });
  },
  async deleteWebTV(id: string): Promise<any> {
    return apiFetch(`/webtv.php?id=${id}`, { method: 'DELETE' });
  },

  // Live Blogs
  async getLiveBlogs(): Promise<LiveBlog[]> {
    return apiFetch('/live.php');
  },
  async saveLiveBlog(blog: Partial<LiveBlog>): Promise<any> {
    return apiFetch('/live.php', { method: 'POST', body: JSON.stringify(blog) });
  },
  async deleteLiveBlog(id: string): Promise<any> {
    return apiFetch(`/live.php?id=${id}`, { method: 'DELETE' });
  },

  // Classifieds
  async getClassifieds(): Promise<Classified[]> {
    return apiFetch('/classifieds.php');
  },
  async saveClassified(item: Partial<Classified>): Promise<any> {
    return apiFetch('/classifieds.php', { method: 'POST', body: JSON.stringify(item) });
  },
  async deleteClassified(id: string): Promise<any> {
    return apiFetch(`/classifieds.php?id=${id}`, { method: 'DELETE' });
  },

  // Authors
  async getAuthors(): Promise<Author[]> {
    return apiFetch('/authors.php');
  },
  async saveAuthor(author: Partial<Author>): Promise<any> {
    return apiFetch('/authors.php', { method: 'POST', body: JSON.stringify(author) });
  },
  async deleteAuthor(id: string): Promise<any> {
    return apiFetch(`/authors.php?id=${id}`, { method: 'DELETE' });
  },

  // Subscribers
  async getSubscribers(): Promise<Subscriber[]> {
    return apiFetch('/subscribers.php');
  },
  async subscribeToNewsletter(email: string): Promise<any> {
    return apiFetch('/subscribers.php', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async unsubscribe(email: string): Promise<any> {
    return apiFetch(`/subscribers.php?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
  },
  async deleteSubscriber(id: string): Promise<any> {
    return apiFetch(`/subscribers.php?id=${id}`, { method: 'DELETE' });
  },

  // History
  async getHistoryEvents(date?: string): Promise<HistoryEvent[]> {
    return apiFetch(date ? `/history.php?date=${date}` : '/history.php');
  },
  async saveHistoryEvent(event: Partial<HistoryEvent>): Promise<any> {
    return apiFetch('/history.php', { method: 'POST', body: JSON.stringify(event) });
  },
  async deleteHistoryEvent(id: string): Promise<any> {
    return apiFetch(`/history.php?id=${id}`, { method: 'DELETE' });
  },

  // Map
  async getMapPoints(): Promise<MapPoint[]> {
    return apiFetch('/map.php');
  },
  async saveMapPoint(point: Partial<MapPoint>): Promise<any> {
    return apiFetch('/map.php', { method: 'POST', body: JSON.stringify(point) });
  },
  async deleteMapPoint(id: string): Promise<any> {
    return apiFetch(`/map.php?id=${id}`, { method: 'DELETE' });
  },

  // Notifications
  async getNotifications() { return apiFetch('/notifications.php'); },
  async sendNotification(data: any) { return apiFetch('/notifications.php', { method: 'POST', body: JSON.stringify(data) }); },
  async markNotificationAsRead(id: string) { return apiFetch('/notifications.php', { method: 'PUT', body: JSON.stringify({ id }) }); },
  async importMockData(articles: any[], events: any[]) {
    return apiFetch('/admin.php?action=import', { method: 'POST', body: JSON.stringify({ articles, events }) });
  },
  subscribeToNotifications(userId: string, callback: (notifs: any[]) => void) {
    const interval = setInterval(async () => {
      try {
        const notifs = await this.getNotifications();
        callback(notifs);
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  },
  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    return apiFetch('/quiz.php');
  },
  async saveQuiz(quiz: Partial<Quiz>): Promise<any> {
    return apiFetch('/quiz.php', { method: 'POST', body: JSON.stringify(quiz) });
  },
  async deleteQuiz(id: string): Promise<any> {
    return apiFetch(`/quiz.php?id=${id}`, { method: 'DELETE' });
  },

  // Stories
  async getStories(): Promise<DiasporaStory[]> {
    return apiFetch('/stories.php');
  },
  async saveStory(story: Partial<DiasporaStory>): Promise<any> {
    return apiFetch('/stories.php', { method: 'POST', body: JSON.stringify(story) });
  },
  async deleteStory(id: string): Promise<any> {
    return apiFetch(`/stories.php?id=${id}`, { method: 'DELETE' });
  },

  // Admin
  async getAdminStats() { return apiFetch('/admin.php?action=stats'); },
  async getAllUsers() { return apiFetch('/admin.php?action=users'); },
  async getAdminActivityLog() { return apiFetch('/admin.php?action=logs'); },
  async isBlocked(id: string) { return apiFetch(`/admin.php?action=isBlocked&id=${id}`); },
  async blockUser(id: string) { return apiFetch('/admin.php?action=block', { method: 'POST', body: JSON.stringify({ id }) }); },
  async unblockUser(id: string) { return apiFetch('/admin.php?action=unblock', { method: 'POST', body: JSON.stringify({ id }) }); },
  async getPendingKYCUsers() {
    const users = await api.getAllUsers();
    return users.filter((u: any) => u.kyc_status === 'pending');
  },
  async updateKYCStatus(uid: string, status: string, reason?: string) {
    return apiFetch('/admin.php?action=updateKYC', { method: 'POST', body: JSON.stringify({ userid: uid, status, reason }) });
  },
  async getTransactions() { return apiFetch('/payments.php'); },
  async upgradeToPremium(uid: string, reason: string, months: number) {
    const until = new Date();
    until.setMonth(until.getMonth() + months);
    return this.updateUserProfile(uid, { ispremium: true, premiumuntil: until.toISOString(), premiummethod: reason });
  },
  async setPremiumUntil(uid: string, date: string) {
    return this.updateUserProfile(uid, { premiumuntil: date });
  },
  async checkPremiumStatus(uid: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    if (!profile.premiumuntil) return false;
    return new Date(profile.premiumuntil) > new Date();
  },
  async recordTransaction(data: any) {
    // Map data to backend if needed
    const payload = {
      userid: data.userId || data.userid,
      email: data.email,
      amount: data.amount,
      method: data.method,
      type: data.type,
      status: data.status,
      reference: data.reference
    };
    return apiFetch('/payments.php', { method: 'POST', body: JSON.stringify(payload) });
  },
  async validatePremiumTransaction(tid: string, uid: string, months: number) {
    return apiFetch(`/payments.php?action=validate&tid=${tid}&uid=${uid}&months=${months}`);
  },
  async notifyAdminPayment(data: any) {
    return this.post('/notifications.php?action=admin_payment', data);
  },
  subscribeToTransactions(callback: (tx: any) => void) {
    const interval = setInterval(async () => {
      try {
        const txs = await this.getTransactions();
        if (txs && txs.length > 0) {
           callback(txs[0]); 
        }
      } catch (e) {}
    }, 15000);
    return () => clearInterval(interval);
  },

  // Support
  async getAllSupportMessages() { return apiFetch('/support.php'); },
  async getSupportMessages(userId: string) { return apiFetch(`/support.php?userId=${userId}`); },
  async sendSupportMessage(data: any) { return apiFetch('/support.php', { method: 'POST', body: JSON.stringify(data) }); },
  subscribeToSupportMessages(userId: string, callback: (messages: SupportMessage[]) => void) {
    const interval = setInterval(async () => {
      try {
        const data = await this.getSupportMessages(userId);
        callback(data);
      } catch(e) {}
    }, 5000);
    return () => clearInterval(interval);
  },
  subscribeToAllSupportMessages(callback: (userid: string, msgs: any[]) => void) {
    const interval = setInterval(async () => {
      try {
        const msgs = await this.getAllSupportMessages();
        Object.keys(msgs).forEach(userid => {
          callback(userid, msgs[userid]);
        });
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  },

  // Chat
  async getChatMessages(articleid: string): Promise<ChatMessage[]> {
    return apiFetch(`/chat.php?articleid=${articleid}`);
  },
  async sendChatMessage(message: Partial<ChatMessage>) {
    return apiFetch('/chat.php', { method: 'POST', body: JSON.stringify(message) });
  },
  subscribeToChat(articleId: string, callback: (messages: ChatMessage[]) => void) {
    const interval = setInterval(async () => {
      try {
        const data = await this.getChatMessages(articleId);
        callback(data);
      } catch(e) {}
    }, 3000);
    return () => clearInterval(interval);
  },

  // Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/upload.php', { method: 'POST', body: formData });
  },

  // Media
  async getMediaLibrary(): Promise<MediaAsset[]> { return apiFetch('/media.php'); },
  async deleteMediaAsset(id: string): Promise<any> { return apiFetch(`/media.php?id=${id}`, { method: 'DELETE' }); },
  
  // Real-time placeholders
  onRealtimeEvent(callback: (event: any) => void) {
    const interval = setInterval(() => callback({ type: 'PING' }), 30000);
    return { unsubscribe: () => clearInterval(interval) };
  },

  // Helpers
  async post(url: string, data: any) { return apiFetch(url, { method: 'POST', body: JSON.stringify(data) }); },
  async put(url: string, data: any) { return apiFetch(url, { method: 'PUT', body: JSON.stringify(data) }); },
  async get(url: string) { return apiFetch(url); },

  // Dummy methods for compatibility
  async trackMedia(_url: string, _type: string) {},
  async addToReadingHistory(_userId: string, _articleId: string) {},
  async updateUserBadges(_userId: string, _badges: string[]) {}
};

export default api;
