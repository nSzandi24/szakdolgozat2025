const { GameSave } = require('../database');

/**
 * Service for managing game state operations for users.
 * Handles retrieval, updates, inventory, flags, scene progression, and resets.
 * @class GameStateService
 */
class GameStateService {
  /**
   * Get or create game state for a user.
   * @param {number|string} userId - The user ID.
   * @returns {Promise<Object>} The user's game state.
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
   * Initialize a new game for a user (reset to defaults).
   * @param {number|string} userId - The user ID.
   * @returns {Promise<Object>} The initialized game state.
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
   * Update game state with partial updates.
   * @param {number|string} userId - The user ID.
   * @param {Object} updates - Partial updates to apply to the game state.
   * @returns {Promise<Object>} The updated game state.
   */
  async updateGameState(userId, updates) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      
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
        game1_completed: updates.game1_completed !== undefined ? updates.game1_completed : gameSave.game1_completed,
        game2_completed: updates.game2_completed !== undefined ? updates.game2_completed : gameSave.game2_completed,
        investigationTime: updates.investigationTime !== undefined ? updates.investigationTime : gameSave.investigationTime,
        notes: updates.notes !== undefined ? updates.notes : gameSave.notes,
      };

      await gameSave.update(updatedState);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }

  /**
   * Progress to next scene in current or different location.
   * @param {number|string} userId - The user ID.
   * @param {string} locationKey - The location key.
   * @param {string} sceneId - The scene ID to progress to.
   * @returns {Promise<Object>} The updated game state.
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
   * Add an item to inventory.
   * @param {number|string} userId - The user ID.
   * @param {string} itemName - The name of the item to add.
   * @returns {Promise<Object>} The updated game state.
   */
  async collectItem(userId, itemName) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const items = [...(gameSave.collectedItems || [])];
      
      if (!items.includes(itemName)) {
        items.push(itemName);
        await gameSave.update({ collectedItems: items });
      }

      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error collecting item:', error);
      throw error;
    }
  }

  /**
   * Remove an item from inventory.
   * @param {number|string} userId - The user ID.
   * @param {string} itemName - The name of the item to remove.
   * @returns {Promise<Object>} The updated game state.
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
   * Set one or more game flags.
   * @param {number|string} userId - The user ID.
   * @param {Object} flags - Flags to set.
   * @returns {Promise<Object>} The updated game state.
   */
  async setFlags(userId, flags) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const updatedFlags = { ...gameSave.gameFlags, ...flags };

      const updateObj = { gameFlags: updatedFlags };
      if (typeof flags.nyomornegyed_decision !== 'undefined') {
        updateObj.nyomornegyed_decision = flags.nyomornegyed_decision;
      }

      await gameSave.update(updateObj);
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error setting flags:', error);
      throw error;
    }
  }

  /**
   * Discover/unlock a new location.
   * @param {number|string} userId - The user ID.
   * @param {string} locationKey - The location key to unlock.
   * @returns {Promise<Object>} The updated game state.
   */
  async discoverLocation(userId, locationKey) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      const locations = [...(gameSave.discoveredLocations || ['otthon'])];
      
      if (!locations.includes(locationKey)) {
        locations.push(locationKey);
        await gameSave.update({ discoveredLocations: locations });
      }

      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error discovering location:', error);
      throw error;
    }
  }

  /**
   * Mark a scene as seen (for 'once' scenes).
   * @param {number|string} userId - The user ID.
   * @param {string} sceneId - The scene ID to mark as seen.
   * @returns {Promise<Object>} The updated game state.
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
   * Mark a restart point as reached (for 'startFromHereUnless' scenes).
   * @param {number|string} userId - The user ID.
   * @param {string} locationKey - The location key.
   * @param {string} sceneId - The scene ID.
   * @returns {Promise<Object>} The updated game state.
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

      await gameSave.reload();
      return gameSave.toGameState();
    } catch (error) {
      console.error('Error marking restart point as reached:', error);
      throw error;
    }
  }

  /**
   * Record mini-game completion.
   * @param {number|string} userId - The user ID.
   * @param {string} gameId - The mini-game ID.
   * @param {boolean} success - Whether the mini-game was completed successfully.
   * @param {Object} [updates] - Additional updates to apply.
   * @returns {Promise<Object>} The updated game state.
   */
  async completeMiniGame(userId, gameId, success, updates = {}) {
    try {
      const gameSave = await GameSave.getOrCreateForUser(userId);
      
      const gameFlags = { ...gameSave.gameFlags };
      gameFlags[`${gameId}Played`] = true;
      
      if (success) {
        gameFlags[`${gameId}Success`] = true;
      } else {
        gameFlags[`${gameId}Failure`] = true;
      }

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
   * Reset game progress for a user.
   * @param {number|string} userId - The user ID.
   * @returns {Promise<Object>} The reset game state.
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

