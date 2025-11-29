const fs = require('fs').promises;
const path = require('path');

class StoryService {
  constructor() {
    this.storyPath = path.join(__dirname, '../story');
    this.metadata = null;
    this.locations = {};
    this.initialized = false;
  }

  /**
   * Initialize the story service by loading metadata and all locations
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load metadata
      const metadataPath = path.join(this.storyPath, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      this.metadata = JSON.parse(metadataContent);

      // Preload all location files
      for (const locationKey of this.metadata.locationOrder) {
        await this.loadLocation(locationKey);
      }

      this.initialized = true;
      console.log('StoryService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize StoryService:', error);
      throw error;
    }
  }

  /**
   * Load a specific location's story data
   */
  async loadLocation(locationKey) {
    try {
      const locationPath = path.join(this.storyPath, 'locations', `${locationKey}.json`);
      const locationContent = await fs.readFile(locationPath, 'utf8');
      this.locations[locationKey] = JSON.parse(locationContent);
      return this.locations[locationKey];
    } catch (error) {
      console.error(`Failed to load location ${locationKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all locations metadata
   */
  getLocationsMetadata() {
    if (!this.initialized) {
      throw new Error('StoryService not initialized');
    }
    return this.metadata.locations;
  }

  /**
   * Get all scenes for a specific location
   */
  getLocationScenes(locationKey) {
    if (!this.initialized) {
      throw new Error('StoryService not initialized');
    }

    const location = this.locations[locationKey];
    if (!location) {
      throw new Error(`Location ${locationKey} not found`);
    }

    return {
      locationKey: location.locationKey,
      displayName: location.displayName,
      backgroundImage: location.backgroundImage,
      scenes: location.scenes,
    };
  }

  /**
   * Get a specific scene from a location by sceneId
   */
  getScene(locationKey, sceneId) {
    locationKey = locationKey.toLowerCase();
    if (!this.initialized) {
      throw new Error('StoryService not initialized');
    }

    const location = this.locations[locationKey];
    if (!location) {
      throw new Error(`Location ${locationKey} not found`);
    }

    const scene = this.findSceneById(locationKey, sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found in location ${locationKey}`);
    }

    return {
      locationKey: location.locationKey,
      displayName: location.displayName,
      backgroundImage: location.backgroundImage,
      sceneId: scene.sceneId,
      scene: scene,
    };
  }

  /**
   * Find a scene by its sceneId within a location
   */
  findSceneById(locationKey, sceneId) {
    const location = this.locations[locationKey];
    if (!location) {
      return null;
    }

    return location.scenes.find(scene => scene.sceneId === sceneId);
  }

  /**
   * Get the current scene for a user based on their game state
   */
  getCurrentScene(gameState) {
    const { currentLocation, currentSceneIds } = gameState;
    const sceneId = currentSceneIds[currentLocation];
    
    if (!sceneId) {
      // No scene ID set, return first scene
      const location = this.locations[currentLocation];
      if (!location || !location.scenes || location.scenes.length === 0) {
        throw new Error(`No scenes available for location ${currentLocation}`);
      }
      return this.getScene(currentLocation, location.scenes[0].sceneId);
    }
    
    return this.getScene(currentLocation, sceneId);
  }

  /**
   * Get location metadata by key
   */
  getLocationMetadata(locationKey) {
    if (!this.initialized) {
      throw new Error('StoryService not initialized');
    }

    const metadata = this.metadata.locations[locationKey];
    if (!metadata) {
      throw new Error(`Location ${locationKey} not found in metadata`);
    }

    return metadata;
  }

  /**
   * Check if a location exists
   */
  locationExists(locationKey) {
    return this.metadata && this.metadata.locations[locationKey] !== undefined;
  }

  /**
   * Get total number of scenes in a location
   */
  getSceneCount(locationKey) {
    const location = this.locations[locationKey];
    return location ? location.scenes.length : 0;
  }

  /**
   * Determine the starting scene ID for a location based on restart points and game state
   * @param {string} locationKey - The location key
   * @param {object} gameState - The current game state containing reachedRestartPoints and gameFlags
   * @param {string} savedSceneId - The saved scene ID from currentSceneIds
   * @returns {string} - The scene ID to start from
   */
  getStartingSceneId(locationKey, gameState, savedSceneId) {
    const location = this.locations[locationKey];
    if (!location || !location.scenes || location.scenes.length === 0) {
      return null;
    }

    const reachedRestartPoints = gameState.reachedRestartPoints || [];
    
    // Find all restart points for this location that have been reached
    const locationRestartPoints = reachedRestartPoints
      .filter(point => point.startsWith(`${locationKey}_`))
      .map(point => {
        const parts = point.split('_');
        return parts.slice(1).join('_'); // Get sceneId part (handles sceneIds with underscores)
      });

    // If no restart points reached, use default behavior
    if (locationRestartPoints.length === 0) {
      return savedSceneId || location.scenes[0].sceneId;
    }

    // Check each restart point (in reverse order to get the latest)
    for (let i = locationRestartPoints.length - 1; i >= 0; i--) {
      const restartSceneId = locationRestartPoints[i];
      const restartScene = this.findSceneById(locationKey, restartSceneId);

      if (!restartScene || restartScene.startFromHereUnless === undefined) {
        continue;
      }

      // If startFromHereUnless is empty string, always restart from here
      if (restartScene.startFromHereUnless === '') {
        return restartSceneId;
      }

      // If startFromHereUnless has a condition, check if it's met
      const condition = restartScene.startFromHereUnless;
      const conditionMet = this.checkCondition(condition, gameState);

      // If condition is met, DON'T use this restart point (fall back to default)
      if (conditionMet) {
        continue;
      }

      // Condition is NOT met, so use this restart point
      return restartSceneId;
    }

    // No valid restart point found, use saved or first scene
    return savedSceneId || location.scenes[0].sceneId;
  }

  /**
   * Check if a condition is met based on game state
   * @param {string} condition - The condition to check
   * @param {object} gameState - The current game state
   * @returns {boolean} - Whether the condition is met
   */
  checkCondition(condition, gameState) {
    // Check game flags
    if (gameState.gameFlags && gameState.gameFlags[condition] !== undefined) {
      return gameState.gameFlags[condition] === true;
    }

    // Check special conditions
    if (condition === 'investigationCompleted') {
      return gameState.investigationCompleted === true;
    }
    if (condition === 'lucasAvailable') {
      return gameState.lucasAvailable === true;
    }

    // Default to false if condition not found
    return false;
  }

  /**
   * Validate all scene references in all locations
   * Checks that all nextScene references point to valid sceneIds
   * @returns {object} - Validation result with errors array
   */
  validateSceneReferences() {
    const errors = [];

    for (const locationKey in this.locations) {
      const location = this.locations[locationKey];
      const sceneIds = new Set(location.scenes.map(s => s.sceneId));

      location.scenes.forEach((scene, index) => {
        // Validate sceneId exists
        if (!scene.sceneId) {
          errors.push({
            location: locationKey,
            sceneIndex: index,
            error: 'Scene missing sceneId property'
          });
        }

        // Check for duplicate sceneIds
        const duplicates = location.scenes.filter(s => s.sceneId === scene.sceneId);
        if (duplicates.length > 1) {
          errors.push({
            location: locationKey,
            sceneId: scene.sceneId,
            error: `Duplicate sceneId found ${duplicates.length} times`
          });
        }

        // Validate nextScene if it exists
        if (scene.nextScene !== undefined && scene.nextScene !== null) {
          if (!sceneIds.has(scene.nextScene)) {
            errors.push({
              location: locationKey,
              sceneId: scene.sceneId,
              invalidReference: scene.nextScene,
              error: `nextScene references non-existent sceneId "${scene.nextScene}"`
            });
          }
        }

        // Validate choices' nextScene
        if (scene.choices && Array.isArray(scene.choices)) {
          scene.choices.forEach((choice, choiceIndex) => {
            if (choice.nextScene !== undefined && choice.nextScene !== null) {
              if (!sceneIds.has(choice.nextScene)) {
                errors.push({
                  location: locationKey,
                  sceneId: scene.sceneId,
                  choiceId: choice.id,
                  choiceIndex,
                  invalidReference: choice.nextScene,
                  error: `Choice "${choice.label}" references non-existent sceneId "${choice.nextScene}"`
                });
              }
            }
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const storyService = new StoryService();
module.exports = storyService;

