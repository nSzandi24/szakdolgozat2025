class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * Save solution answers
   */
  async saveSolution(answers) {
    return this.post('/api/game/solution', answers);
  }

  /**
   * Generic fetch wrapper
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'same-origin', // Include cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401) {
          // Redirect to login if unauthorized
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
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== Story API =====

  /**
   * Get all locations metadata
   */
  async getLocations() {
    return this.get('/api/story/locations');
  }

  /**
   * Get all scenes for a location
   */
  async getLocationScenes(locationKey) {
    return this.get(`/api/story/${locationKey}`);
  }

  /**
   * Get specific scene
   */
  async getScene(locationKey, sceneIndex) {
    return this.get(`/api/story/${locationKey}/${sceneIndex}`);
  }

  // ===== Game State API =====

  /**
   * Get user's complete game state
   */
  async getGameState() {
    return this.get('/api/game/state');
  }

  /**
   * Initialize/reset game
   */
  async initializeGame() {
    return this.post('/api/game/initialize', {});
  }

  /**
   * Update game state
   */
  async updateGameState(updates) {
    return this.post('/api/game/update', updates);
  }

  /**
   * Progress to a specific scene
   */
  async progressScene(locationKey, sceneId) {
    return this.post('/api/game/progress', { locationKey, sceneId });
  }

  /**
   * Add item to inventory
   */
  async collectItem(itemName) {
    return this.post('/api/game/collect-item', { itemName });
  }

  /**
   * Remove item from inventory
   */
  async removeItem(itemName) {
    return this.post('/api/game/remove-item', { itemName });
  }

  /**
   * Set game flag(s)
   */
  async setFlags(flags) {
    return this.post('/api/game/set-flag', flags);
  }

  /**
   * Discover/unlock a location
   */
  async discoverLocation(locationKey) {
    return this.post('/api/game/discover-location', { locationKey });
  }

  /**
   * Mark a restart point as reached
   */
  async markRestartPoint(locationKey, sceneId) {
    return this.post('/api/game/mark-restart-point', { locationKey, sceneId });
  }

  /**
   * Get the starting scene ID for a location based on restart points
   */
  async getStartingScene(locationKey) {
    return this.post('/api/story/starting-scene', { locationKey });
  }

  /**
   * Record mini-game completion
   */
  async completeMiniGame(gameId, success, updates = {}) {
    return this.post('/api/game/mini-game/complete', { gameId, success, updates });
  }

  /**
   * Reset game progress
   */
  async resetGame() {
    return this.delete('/api/game/reset');
  }

  // ===== Auth API =====

  /**
   * Login
   */
  async login(email, password) {
    return this.post('/login', { email, password });
  }

  /**
   * Register
   */
  async register(username, email, password) {
    return this.post('/register', { username, email, password });
  }

  /**
   * Logout
   */
  async logout() {
    return this.post('/logout', {});
  }
}

// Export singleton instance
const apiClient = new APIClient();

