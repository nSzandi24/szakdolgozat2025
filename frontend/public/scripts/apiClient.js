/**
 * API client for communicating with backend endpoints.
 * Handles game, story, and authentication API calls.
 * @class APIClient
 */
class APIClient {
  /**
   * Create a new APIClient instance.
   * @param {string} [baseURL] - The base URL for API requests.
   */
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * Save solution answers.
   * @param {Object} answers - The user's answers.
   * @returns {Promise<Object>} API response.
   */
  async saveSolution(answers) {
    return this.post('/api/game/solution', answers);
  }

  /**
   * Generic fetch wrapper for API requests.
   * Handles errors, JSON parsing, and authentication redirects.
   * @param {string} endpoint - The API endpoint.
   * @param {Object} [options] - Fetch options.
   * @returns {Promise<Object>} API response data.
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', 
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          if (window.location.pathname !== '/login.html' && window.location.pathname !== '/index.html') {
            alert('A munkamenet lejárt. Kérjük jelentkezzen be újra.');
            window.location.href = 'login.html';
          }
          throw new Error(data.message || 'Nincs hitelesítve.');
        }

        throw new Error(data.message || 'Hiba történt a kérés során.');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Perform a GET request.
   * @param {string} endpoint - The API endpoint.
   * @returns {Promise<Object>} API response data.
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * Perform a POST request.
   * @param {string} endpoint - The API endpoint.
   * @param {Object} body - The request body.
   * @returns {Promise<Object>} API response data.
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Perform a DELETE request.
   * @param {string} endpoint - The API endpoint.
   * @returns {Promise<Object>} API response data.
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== Story API =====

  /**
   * Get all locations metadata.
   * @returns {Promise<Object>} API response with locations metadata.
   */
  async getLocations() {
    return this.get('/api/story/locations');
  }

  /**
   * Get all scenes for a location.
   * @param {string} locationKey - The location key.
   * @returns {Promise<Object>} API response with location scenes.
   */
  async getLocationScenes(locationKey) {
    return this.get(`/api/story/${locationKey}`);
  }

  /**
   * Get a specific scene from a location.
   * @param {string} locationKey - The location key.
   * @param {number|string} sceneIndex - The scene index.
   * @returns {Promise<Object>} API response with scene data.
   */
  async getScene(locationKey, sceneIndex) {
    return this.get(`/api/story/${locationKey}/${sceneIndex}`);
  }

  // ===== Game State API =====

  /**
   * Get user's complete game state.
   * @returns {Promise<Object>} API response with game state.
   */
  async getGameState() {
    return this.get('/api/game/state');
  }

  /**
   * Initialize/reset game.
   * @returns {Promise<Object>} API response with initialized game state.
   */
  async initializeGame() {
    return this.post('/api/game/initialize', {});
  }

  /**
   * Update game state.
   * @param {Object} updates - Partial updates to apply.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async updateGameState(updates) {
    return this.post('/api/game/update', updates);
  }

  /**
   * Progress to a specific scene.
   * @param {string} locationKey - The location key.
   * @param {string} sceneId - The scene ID.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async progressScene(locationKey, sceneId) {
    return this.post('/api/game/progress', { locationKey, sceneId });
  }

  /**
   * Add item to inventory.
   * @param {string} itemName - The name of the item to add.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async collectItem(itemName) {
    return this.post('/api/game/collect-item', { itemName });
  }

  /**
   * Remove item from inventory.
   * @param {string} itemName - The name of the item to remove.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async removeItem(itemName) {
    return this.post('/api/game/remove-item', { itemName });
  }

  /**
   * Set game flag(s).
   * @param {Object} flags - Flags to set.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async setFlags(flags) {
    return this.post('/api/game/set-flag', flags);
  }

  /**
   * Discover/unlock a location.
   * @param {string} locationKey - The location key to unlock.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async discoverLocation(locationKey) {
    return this.post('/api/game/discover-location', { locationKey });
  }

  /**
   * Mark a restart point as reached.
   * @param {string} locationKey - The location key.
   * @param {string} sceneId - The scene ID.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async markRestartPoint(locationKey, sceneId) {
    return this.post('/api/game/mark-restart-point', { locationKey, sceneId });
  }

  /**
   * Get the starting scene ID for a location based on restart points.
   * @param {string} locationKey - The location key.
   * @returns {Promise<Object>} API response with starting scene ID.
   */
  async getStartingScene(locationKey) {
    return this.post('/api/story/starting-scene', { locationKey });
  }

  /**
   * Record mini-game completion.
   * @param {string} gameId - The mini-game ID.
   * @param {boolean} success - Whether the mini-game was completed successfully.
   * @param {Object} [updates] - Additional updates to apply.
   * @returns {Promise<Object>} API response with updated game state.
   */
  async completeMiniGame(gameId, success, updates = {}) {
    return this.post('/api/game/mini-game/complete', { gameId, success, updates });
  }

  /**
   * Reset game progress.
   * @returns {Promise<Object>} API response with reset game state.
   */
  async resetGame() {
    return this.delete('/api/game/reset');
  }

  /**
   * Mark the given game as completed (game1 or game2).
   * @param {'game1'|'game2'} game - The game identifier.
   * @returns {Promise<Object>} API response with success and message.
   */
  async completeGame(game) {
    if (game !== 'game1' && game !== 'game2') throw new Error('Hibás játék azonosító');
    return this.post('/api/game/complete', { game });
  }

  // ===== Auth API =====

  /**
   * Login.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} API response with authentication result.
   */
  async login(email, password) {
    return this.post('/login', { email, password });
  }

  /**
   * Register a new user.
   * @param {string} username - The user's username.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} API response with registration result.
   */
  async register(username, email, password) {
    return this.post('/register', { username, email, password });
  }

  /**
   * Logout the current user.
   * @returns {Promise<Object>} API response with logout result.
   */
  async logout() {
    return this.post('/logout', {});
  }
}

// Export singleton instance
const apiClient = new APIClient();
window.apiClient = apiClient;

