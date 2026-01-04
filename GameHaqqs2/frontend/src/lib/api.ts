/**
 * REAL API CALLS TO LARAVEL BACKEND
 * Base URL: http://127.0.0.1:8000/api (development)
 * 
 * All API calls are documented with:
 * - Endpoint: HTTP method and path
 * - What it does
 * - Database changes
 * - Authorization requirements
 * - How to test in Postman
 */

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Helper to get auth token from localStorage
 */
function getAuthToken(): string | null {
  const token = localStorage.getItem('auth_token');
  console.log('🔑 Auth token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
  return token;
}

/**
 * Helper to make authenticated API requests
 * Automatically includes Authorization header with Bearer token
 */
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`📡 API Request: ${endpoint}`, { hasToken: !!token, headers });
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to parse JSON error body, fall back to text for HTML error pages
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch (e) {
      try {
        errorBody = await response.text();
      } catch (e2) {
        errorBody = null;
      }
    }

    const message = (errorBody && (errorBody.message || JSON.stringify(errorBody))) || `${response.status} ${response.statusText}`;
    console.error('API request failed', { endpoint, status: response.status, body: errorBody });
    throw new Error(message);
  }

  // Parse JSON response (most API responses are JSON)
  return response.json();
}

export const api = {
  /**
   * POST /api/login
   * Login with email and password
   * Returns: { access_token, user }
   * Postman: POST http://127.0.0.1:8000/api/login
   */
  login: async (email: string, password: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/login`);
    return makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * POST /api/register
   * Register new user - creates record in users table
   * Returns: { access_token, user }
   * Database: INSERT INTO users (name, email, password, role)
   * Postman: POST http://127.0.0.1:8000/api/register
   */
  register: async (username: string, email: string, password: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/register`);
    return makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        name: username,
        email,
        password,
        password_confirmation: password,
      }),
    });
  },

  /**
   * GET /api/user
   * Get current authenticated user profile
   * Requires: Authorization Bearer token
   * Returns: { id, name, email, role, created_at }
   * Database: SELECT * FROM users WHERE id = current_user_id
   * Postman: GET http://127.0.0.1:8000/api/user
   *          Header: Authorization: Bearer {token}
   */
  getUser: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/user`);
    return makeRequest('/user');
  },

  /**
   * GET /api/v1/users (Admin only)
   * Get all users - paginated
   * Requires: Admin role token
   * Returns: { data: [{user}, ...], pagination: {...} }
   * Database: SELECT * FROM users LIMIT 15
   * Postman: GET http://127.0.0.1:8000/api/v1/users?page=1
   *          Header: Authorization: Bearer {admin_token}
   */
  getAdminUsers: async (page = 1) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/users?page=${page}`);
    return makeRequest(`/v1/users?page=${page}`);
  },

  /**
   * GET /api/v1/games (Protected)
   * Get all games
   * Requires: Authorization Bearer token
   * Returns: { data: [{game}, ...], pagination: {...} }
   * Database: SELECT * FROM games LIMIT 15
   * Postman: GET http://127.0.0.1:8000/api/v1/games?page=1
   *          Header: Authorization: Bearer {token}
   */
  getAdminGames: async (page = 1, perPage = 100) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/games?page=${page}&per_page=${perPage}`);
    return makeRequest(`/v1/games?page=${page}&per_page=${perPage}`);
  },

  /**
   * GET /api/v1/admin/data (Admin only)
   * Get dashboard data with aggregated stats
   * Requires: Admin role token
   * Returns: { total_users, total_games, total_reviews, ... }
   * Database: SELECT COUNT(*) FROM multiple tables
   * Postman: GET http://127.0.0.1:8000/api/v1/admin/data
   *          Header: Authorization: Bearer {admin_token}
   */
  getAdminData: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/admin/data`);
    return makeRequest('/v1/admin/data');
  },

  /**
   * GET /api/v1/posts (Protected)
   * Get all community posts - paginated
   * Requires: Authorization Bearer token
   * Returns: { data: [{post}, ...], pagination: {...} }
  /**
   * GET /api/v1/moderator/pending-posts (Moderator only)
   * Fetch pending posts for moderator review
   * Requires: Moderator role token
   * Database: SELECT * FROM posts WHERE status = 'pending'
   * Returns: [...pending posts...]
   * Postman: GET http://127.0.0.1:8000/api/v1/moderator/pending-posts
   *          Header: Authorization: Bearer {moderator_token}
   */
  getModeratorPosts: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/moderator/pending-posts`);
    const response = await makeRequest(`/v1/moderator/pending-posts`);
    // Backend returns array of pending posts directly
    return Array.isArray(response) ? response : (response.data || []);
  },

  /**
   * GET /api/v1/moderator/all-posts (Moderator only)
   * Fetch all posts (pending, approved, declined) for moderator dashboard
   * Requires: Moderator role token
   * Database: SELECT * FROM posts WHERE status IN ('pending', 'approved', 'rejected')
   * Returns: [...all posts with status field...]
   * Postman: GET http://127.0.0.1:8000/api/v1/moderator/all-posts
   *          Header: Authorization: Bearer {moderator_token}
   */
  getAllModeratorPosts: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/moderator/all-posts`);
    try {
      const response = await makeRequest(`/v1/moderator/all-posts`);
      console.log('✅ getAllModeratorPosts response:', response);
      console.log('✅ Response type:', typeof response, 'Is array:', Array.isArray(response));
      // Backend returns array of all posts with status included
      const posts = Array.isArray(response) ? response : (response.data || []);
      console.log('✅ Returning posts:', posts.length, 'posts');
      return posts;
    } catch (error: any) {
      console.error('❌ getAllModeratorPosts failed:', error);
      throw error;
    }
  },

  /**
   * POST /api/v1/moderator/posts/{postId}/approve (Moderator only)
   * POST /api/v1/moderator/posts/{postId}/decline (Moderator only)
   * Approve or decline a pending post
   * Requires: Moderator role token
   * Database: UPDATE posts SET status = 'approved'|'rejected', creates moderator_actions record
   * Postman: POST http://127.0.0.1:8000/api/v1/moderator/posts/1/approve
   *          Header: Authorization: Bearer {moderator_token}
   */
  reviewPost: async (postId: string, action: 'approve' | 'reject') => {
    const endpoint = action === 'approve' ? 'approve' : 'decline';
    console.log(`🔗 BACKEND CALL: POST /api/v1/moderator/posts/${postId}/${endpoint}`);
    return makeRequest(`/v1/moderator/posts/${postId}/${endpoint}`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/v1/posts
   * Create new community post with optional image/video uploads
   * Requires: Authorization Bearer token
   * Database: INSERT INTO posts (user_id, title, content, image_url, video_url, status) VALUES (?, ?, ?, ?, ?, 'pending')
   * Returns: { id, user_id, title, content, image_url, video_url, status, created_at }
   * Postman: POST http://127.0.0.1:8000/api/v1/posts
   *          Header: Authorization: Bearer {token}
   *          Body (multipart/form-data): { title: "...", content: "...", image?: File, video?: File }
   */
  createCommunityPost: async (formData: FormData) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/posts`);
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/v1/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData, // multipart/form-data, no Content-Type header needed
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      
      // Handle validation errors
      if (errorData.errors) {
        const errorMessages = Object.values(errorData.errors).flat();
        throw new Error(errorMessages.join('. '));
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * GET /api/v1/posts (Protected)
   * Get approved community posts
   * Returns: { data: [{post}, ...] }
   * Database: SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC
   * Postman: GET http://127.0.0.1:8000/api/v1/posts
   *          Header: Authorization: Bearer {token}
   */
  getCommunityPosts: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/posts`);
    return makeRequest('/v1/posts');
  },

  /**
   * POST /api/v1/posts/{postId}/like
   * Toggle like on a community post
   * Returns: { liked: boolean, likes_count: number }
   * Database: INSERT/DELETE FROM likes WHERE user_id = ? AND likeable_id = ? AND likeable_type = 'Post'
   */
  togglePostLike: async (postId: number) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/posts/${postId}/like`);
    return makeRequest(`/v1/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  /**
   * POST /api/v1/posts/{postId}/comment
   * Add a comment to a community post
   * Returns: { message: string, comment: { id, author, content, created_at } }
   * Database: INSERT INTO comments (author_id, content, commentable_type, commentable_id)
   */
  addPostComment: async (postId: number, content: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/posts/${postId}/comment`);
    return makeRequest(`/v1/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * DELETE /api/v1/posts/{postId}
   * Delete a community post (author only)
   * Requires: Authorization Bearer token + must be post author
   * Database: DELETE FROM posts WHERE id = ? AND user_id = ?
   * Returns: { message: "Post deleted successfully" }
   * Postman: DELETE http://127.0.0.1:8000/api/v1/posts/1
   *          Header: Authorization: Bearer {token}
   */
  deleteCommunityPost: async (postId: string) => {
    console.log(`🔗 BACKEND CALL: DELETE /api/v1/posts/${postId}`);
    return makeRequest(`/v1/posts/${postId}`, { method: 'DELETE' });
  },

  /**
   * POST /api/v1/posts/{postId}/like
   * Like/Unlike a post
   * Requires: Authorization Bearer token
   * Database: INSERT/DELETE FROM likes (user_id, post_id)
   * Returns: { message: "Post liked", likes_count: 42 }
   * Postman: POST http://127.0.0.1:8000/api/v1/posts/1/like
   *          Header: Authorization: Bearer {token}
   */
  likeCommunityPost: async (postId: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/posts/${postId}/like`);
    return makeRequest(`/v1/posts/${postId}/like`, { method: 'POST' });
  },

  /**
   * POST /api/v1/posts/{postId}/comment
   * Add comment to a post
   * Requires: Authorization Bearer token
   * Database: INSERT INTO comments (user_id, post_id, content)
   * Returns: { id, user_id, post_id, content, created_at }
   * Postman: POST http://127.0.0.1:8000/api/v1/posts/1/comment
   *          Header: Authorization: Bearer {token}
   *          Body: { content: "Great post!" }
   */
  addComment: async (postId: string, content: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/posts/${postId}/comment`);
    return makeRequest(`/v1/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * POST /api/logout
   * Logout current user - invalidates token
   * Requires: Authorization Bearer token
   * Database: Invalidates token in sanctum_personal_access_tokens
   * Returns: { message: "Logged out successfully" }
   * Postman: POST http://127.0.0.1:8000/api/logout
   *          Header: Authorization: Bearer {token}
   */
  logout: async () => {
    console.log(`🔗 BACKEND CALL: POST /api/logout`);
    return makeRequest('/logout', { method: 'POST' });
  },

  /**
   * GET /api/v1/reviews?game_id={gameId}
   * Get all reviews for a specific game
   * Requires: Authorization Bearer token
   * Returns: { data: [{review}, ...], meta: {...} }
   * Database: SELECT * FROM reviews WHERE game_id = ?
   * Postman: GET http://127.0.0.1:8000/api/v1/reviews?game_id=1
   *          Header: Authorization: Bearer {token}
   */
  getGameReviews: async (gameId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/reviews?game_id=${gameId}`);
    return makeRequest(`/v1/reviews?game_id=${gameId}`);
  },

  /**
   * GET /api/v1/games/{gameId}/reviews/stats
   * Get rating statistics for a specific game
   * Requires: Authorization Bearer token
   * Returns: { data: { total_reviews, average_rating, distribution } }
   * Postman: GET http://127.0.0.1:8000/api/v1/games/1/reviews/stats
   *          Header: Authorization: Bearer {token}
   */
  getGameRatingStats: async (gameId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/games/${gameId}/reviews/stats`);
    return makeRequest(`/v1/games/${gameId}/reviews/stats`);
  },

  /**
   * POST /api/v1/games/{gameId}/reviews
   * Create new review for a game
   * Requires: Authorization Bearer token
   * Database: INSERT INTO reviews (game_id, author_id, rating, pros, cons, content)
   * Returns: { review_id, xp_awarded }
   * Rating: 0-5 scale (5 stars)
   * Postman: POST http://127.0.0.1:8000/api/v1/games/1/reviews
   *          Header: Authorization: Bearer {token}
   *          Body: { rating: 4.5, pros: "...", cons: "...", content: "..." }
   */
  createGameReview: async (gameId: number, reviewData: {
    rating: number;
    pros?: string;
    cons?: string;
    content: string;
  }) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/games/${gameId}/reviews`);
    return makeRequest(`/v1/games/${gameId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  /**
   * GET /api/v1/tips?game_id={gameId}
   * Get all tips for a specific game
   * Requires: Authorization Bearer token
   * Returns: { data: [{tip}, ...], meta: {...} }
   * Database: SELECT * FROM tips_and_tricks WHERE game_id = ?
   * Postman: GET http://127.0.0.1:8000/api/v1/tips?game_id=1
   *          Header: Authorization: Bearer {token}
   */
  getGameTips: async (gameId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/tips?game_id=${gameId}`);
    return makeRequest(`/v1/tips?game_id=${gameId}`);
  },

  /**
   * POST /api/v1/games/{gameId}/tips
   * Create new tip for a game
   * Requires: Authorization Bearer token
   * Database: INSERT INTO tips_and_tricks (game_id, author_id, title, content)
   * Returns: { tip_id, xp_awarded }
   * Postman: POST http://127.0.0.1:8000/api/v1/games/1/tips
   *          Header: Authorization: Bearer {token}
   *          Body: { title: "...", content: "..." }
   */
  createGameTip: async (gameId: number, tipData: {
    title: string;
    content: string;
  }) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/games/${gameId}/tips`);
    return makeRequest(`/v1/games/${gameId}/tips`, {
      method: 'POST',
      body: JSON.stringify(tipData),
    });
  },

  /**
   * POST /api/v1/games (Admin only)
   * Create a new game - supports multipart form data for image upload
   * Requires: Admin role token
   * Database: INSERT INTO games (title, genre, release_date, developer, description, platform, image_url, rating)
   * Returns: { message, data: {game} }
   * Postman: POST http://127.0.0.1:8000/api/v1/games
   *          Header: Authorization: Bearer {admin_token}
   *          Body (form-data): title, genre, release_date, developer, description, platform, image, rating
   */
  createGame: async (formData: FormData) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/games`);
    const token = getAuthToken();
    const headers: any = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/v1/games`, {
      method: 'POST',
      headers,
      body: formData, // FormData sets its own Content-Type with boundary
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => response.text());
      throw new Error(errorBody.message || `${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * PATCH /api/v1/games/{gameId} (Admin only)
   * Update game information - supports multipart form data for image upload
   * Requires: Admin role token
   * Database: UPDATE games SET ... WHERE id = {gameId}
   * Returns: { message, data: {game} }
   * Postman: PATCH http://127.0.0.1:8000/api/v1/games/1
   *          Header: Authorization: Bearer {admin_token}
   *          Body (form-data): title, genre, release_date, developer, description, platform, image, rating
   */
  updateGame: async (gameId: number, formData: FormData) => {
    console.log(`🔗 BACKEND CALL: PATCH /api/v1/games/${gameId}`);
    const token = getAuthToken();
    const headers: any = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add _method for Laravel's PATCH support with FormData
    formData.append('_method', 'PATCH');

    const response = await fetch(`${API_BASE_URL}/v1/games/${gameId}`, {
      method: 'POST', // Use POST with _method=PATCH for FormData compatibility
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => response.text());
      throw new Error(errorBody.message || `${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * DELETE /api/v1/games/{gameId} (Admin only)
   * Delete a game from the library
   * Requires: Admin role token
   * Database: DELETE FROM games WHERE id = {gameId}
   * Returns: { message }
   * Postman: DELETE http://127.0.0.1:8000/api/v1/games/1
   *          Header: Authorization: Bearer {admin_token}
   */
  deleteGame: async (gameId: number) => {
    console.log(`🔗 BACKEND CALL: DELETE /api/v1/games/${gameId}`);
    return makeRequest(`/v1/games/${gameId}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/v1/reports
   * Report a post/user
   * Requires: Authorization Bearer token
   * Database: INSERT INTO reports (reporter_id, reported_user_id, post_id, reason, status)
   * Returns: { message, data }
   */
  createReport: async (reportedUserId: number, postId: number, reason: string) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/reports`);
    return makeRequest('/v1/reports', {
      method: 'POST',
      body: JSON.stringify({ reported_user_id: reportedUserId, post_id: postId, reason }),
    });
  },

  /**
   * GET /api/v1/reports (Admin only)
   * Get all reports
   * Returns: { data: [{report}, ...], current_page, last_page, total }
   */
  getReports: async (page = 1) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/reports?page=${page}`);
    return makeRequest(`/v1/reports?page=${page}`);
  },

  /**
   * POST /api/v1/reports/{userId}/mute (Admin only)
   * Mute a user for 30 minutes
   * Returns: { message, muted_until }
   */
  muteUser: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/reports/${userId}/mute`);
    return makeRequest(`/v1/reports/${userId}/mute`, {
      method: 'POST',
    });
  },

  /**
   * PATCH /api/v1/reports/{reportId}/dismiss (Admin only)
   * Dismiss a report
   * Returns: { message, data }
   */
  dismissReport: async (reportId: number) => {
    console.log(`🔗 BACKEND CALL: PATCH /api/v1/reports/${reportId}/dismiss`);
    return makeRequest(`/v1/reports/${reportId}/dismiss`, {
      method: 'PATCH',
    });
  },

  /**
   * DELETE /api/v1/users/{userId} (Admin only)
   * Delete a user permanently
   * Returns: { message }
   */
  deleteUser: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: DELETE /api/v1/users/${userId}`);
    return makeRequest(`/v1/users/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/v1/games/{gameId}/favorite
   * Add or remove a game from user favorites
   * Requires: Authorization Bearer token
   * Database: INSERT/DELETE FROM favorites (user_id, game_id)
   * Returns: { favorited: boolean }
   * Postman: POST http://127.0.0.1:8000/api/v1/games/1/favorite
   *          Header: Authorization: Bearer {token}
   *          Body: { action: "add" } or { action: "remove" }
   */
  toggleFavoriteGame: async (gameId: number, action: 'add' | 'remove') => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/games/${gameId}/favorite - ${action}`);
    return makeRequest(`/v1/games/${gameId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  /**
   * GET /api/v1/users/{userId}/favorites
   * Get user's favorite games
   * Requires: Authorization Bearer token (user can view their own, admin can view anyone's)
   * Returns: [{ id, game_id, created_at, game }, ...]
   * Database: SELECT * FROM favorites WHERE user_id = {userId}
   * Postman: GET http://127.0.0.1:8000/api/v1/users/1/favorites
   *          Header: Authorization: Bearer {token}
   */
  getUserFavorites: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/users/${userId}/favorites`);
    return makeRequest(`/v1/users/${userId}/favorites`);
  },

  /**
   * GET /api/v1/users/{userId}/achievements
   * Get user's achievements with unlock status and progress
   * Returns: { achievements: [...], total: number, unlocked: number }
   */
  getUserAchievements: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/users/${userId}/achievements`);
    return makeRequest(`/v1/users/${userId}/achievements`);
  },

  /**
   * POST /api/v1/users/{userId}/achievements/check
   * Check and auto-unlock achievements based on user progress
   * Returns: { message, newly_unlocked: [...], count }
   */
  checkAchievements: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: POST /api/v1/users/${userId}/achievements/check`);
    return makeRequest(`/v1/users/${userId}/achievements/check`, {
      method: 'POST',
    });
  },

  /**
   * GET /api/v1/leaderboard
   * Get leaderboard rankings (users only, no admins/moderators)
   * Returns: { period, top: [...], total_users }
   */
  getLeaderboard: async (period = 'all-time') => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/leaderboard?period=${period}`);
    return makeRequest(`/v1/leaderboard?period=${period}`);
  },

  /**
   * GET /api/v1/leaderboard/user/{userId}
   * Get user's rank on leaderboard
   * Returns: { user_id, username, rank, xp, level, total_users, percentile }
   */
  getUserRank: async (userId: number) => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/leaderboard/user/${userId}`);
    return makeRequest(`/v1/leaderboard/user/${userId}`);
  },

  /**
   * GET /api/v1/notifications
   * Get user's notifications
   * Requires: Authorization Bearer token
   * Returns: [{ id, type, title, message, timestamp, read }, ...]
   * Database: SELECT * FROM notifications WHERE user_id = {userId}
   */
  getNotifications: async () => {
    console.log(`🔗 BACKEND CALL: GET /api/v1/notifications`);
    const response = await makeRequest(`/v1/notifications`);
    return Array.isArray(response) ? response : (response.data || []);
  },

  /**
   * PATCH /api/v1/notifications/{id}/read
   * Mark a notification as read
   * Requires: Authorization Bearer token
   */
  markNotificationAsRead: async (id: string) => {
    console.log(`🔗 BACKEND CALL: PATCH /api/v1/notifications/${id}/read`);
    return makeRequest(`/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read
   * Requires: Authorization Bearer token
   */
  markAllNotificationsAsRead: async () => {
    console.log(`🔗 BACKEND CALL: PATCH /api/v1/notifications/read-all`);
    return makeRequest(`/v1/notifications/read-all`, {
      method: 'PATCH',
    });
  },

  /**
   * DELETE /api/v1/notifications/{id}
   * Delete a notification
   * Requires: Authorization Bearer token
   */
  deleteNotification: async (id: string) => {
    console.log(`🔗 BACKEND CALL: DELETE /api/v1/notifications/${id}`);
    return makeRequest(`/v1/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};
