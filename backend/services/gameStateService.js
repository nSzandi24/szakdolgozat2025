const { GameSave } = require('../database');

class GameStateService {
  /**
   * Get or create game state for a user
   */
  async getGameState(userId) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  }

  /**
   * Initialize a new game for a user (reset to defaults)
   */
  async initializeGame(userId) {
    try {
      const gameSave = await GameSave.resetProgress(userId);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error initializing game:', error);
      throw error;
    }
  }

  /**
   * Update game state with partial updates
   */
  async updateGameState(userId, updates) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      
      // Merge updates with existing state
      const updatedState = {
        currentLocation: updates.currentLocation || gameSave.currentLocation,
        currentSceneIds: { ...gameSave.currentSceneIds, ...(updates.currentSceneIds || {}) },
        discoveredLocations: updates.discoveredLocations || gameSave.discoveredLocations,
        gameFlags: { ...gameSave.gameFlags, ...(updates.gameFlags || {}) },
        collectedItems: updates.collectedItems !== undefined ? updates.collectedItems : gameSave.collectedItems,
        seenOnceScenes: updates.seenOnceScenes !== undefined ? updates.seenOnceScenes : gameSave.seenOnceScenes,
        investigationCompleted: updates.investigationCompleted !== undefined ? updates.investigationCompleted : gameSave.investigationCompleted,
        lucasDialogueCompleted: updates.lucasDialogueCompleted !== undefined ? updates.lucasDialogueCompleted : gameSave.lucasDialogueCompleted,
        lucasAvailable: updates.lucasAvailable !== undefined ? updates.lucasAvailable : gameSave.lucasAvailable,
      };

      await gameSave.update(updatedState);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }

  /**
   * Progress to next scene in current or different location
   */
  async progressScene(userId, locationKey, sceneId) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      
      const updates = {
        currentLocation: locationKey,
        currentSceneIds: { ...gameSave.currentSceneIds, [locationKey]: sceneId },
      };

      await gameSave.update(updates);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error progressing scene:', error);
      throw error;
    }
  }

  /**
   * Add an item to inventory
   */
  async collectItem(userId, itemName) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const items = [...(gameSave.collectedItems || [])];
      
      // Don't add duplicates
      if (!items.includes(itemName)) {
        items.push(itemName);
        await gameSave.update({ collectedItems: items });
      }

      // Reload to get the latest state from database
      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error collecting item:', error);
      throw error;
    }
  }

  /**
   * Remove an item from inventory
   */
  async removeItem(userId, itemName) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const items = gameSave.collectedItems || [];
      
      const index = items.indexOf(itemName);
      if (index > -1) {
        items.splice(index, 1);
        await gameSave.update({ collectedItems: items });
      }

      return gameSave.toGameState();
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  /**
   * Set one or more game flags
   */
  async setFlags(userId, flags) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const updatedFlags = { ...gameSave.gameFlags, ...flags };
      
      await gameSave.update({ gameFlags: updatedFlags });
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error setting flags:', error);
      throw error;
    }
  }

  /**
   * Discover/unlock a new location
   */
  async discoverLocation(userId, locationKey) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const locations = [...(gameSave.discoveredLocations || ['otthon'])];
      
      if (!locations.includes(locationKey)) {
        locations.push(locationKey);
        await gameSave.update({ discoveredLocations: locations });
      }

      // Reload to get the latest state from database
      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error discovering location:', error);
      throw error;
    }
  }

  /**
   * Mark a scene as seen (for 'once' scenes)
   */
  async markSceneSeen(userId, sceneId) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const seenScenes = gameSave.seenOnceScenes || [];
      
      if (!seenScenes.includes(sceneId)) {
        seenScenes.push(sceneId);
        await gameSave.update({ seenOnceScenes: seenScenes });
      }

      return gameSave.toGameState();
    } catch (error) {
      console.error('Error marking scene as seen:', error);
      throw error;
    }
  }

  /**
   * Mark a restart point as reached (for 'startFromHereUnless' scenes)
   */
  async markRestartPointReached(userId, locationKey, sceneId) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const restartPoints = [...(gameSave.reachedRestartPoints || [])];
      const restartPointId = `${locationKey}_${sceneId}`;
      
      if (!restartPoints.includes(restartPointId)) {
        restartPoints.push(restartPointId);
        await gameSave.update({ reachedRestartPoints: restartPoints });
      }

      // Reload to get the latest state from database
      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error marking restart point as reached:', error);
      throw error;
    }
  }

  /**
   * Record mini-game completion
   */
  async completeMiniGame(userId, gameId, success, updates = {}) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      
      // Set game-specific flags
      const gameFlags = { ...gameSave.gameFlags };
      gameFlags[`${gameId}Played`] = true;
      
      if (success) {
        gameFlags[`${gameId}Success`] = true;
      } else {
        gameFlags[`${gameId}Failure`] = true;
      }

      // Apply any additional updates
      const finalUpdates = {
        gameFlags,
        ...updates,
      };

      await gameSave.update(finalUpdates);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error completing mini-game:', error);
      throw error;
    }
  }

  /**
   * Reset game progress for a user
   */
  async resetProgress(userId) {
    try {
      const gameSave = await GameSave.resetProgress(userId);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }
}

module.exports = new GameStateService();

