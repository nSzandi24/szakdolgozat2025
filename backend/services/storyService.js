const fs = require('fs').promises;
const path = require('path');

/**
 * Service for managing story data, locations, scenes, and validation.
 * Handles loading, retrieval, and validation of story content.
 * @class StoryService
 */
class StoryService {
  /**
   * Create a new StoryService instance.
   * @constructor
   */
  constructor() {
    this.storyPath = path.join(__dirname, '../story');
    this.metadata = null;
    this.locations = {};
    this.initialized = false;
  }

  /**
   * Initialize the story service by loading metadata and all locations.
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const metadataPath = path.join(this.storyPath, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      this.metadata = JSON.parse(metadataContent);

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
   * Load a specific location's story data.
   * @param {string} locationKey - The key of the location to load.
   * @returns {Promise<Object>} The loaded location data.
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
   * Get all locations metadata.
   * @returns {Object} Locations metadata.
   */
  getLocationsMetadata() {
    if (!this.initialized) {
      throw new Error('StoryService not initialized');
    }
    return this.metadata.locations;
  }

  /**
   * Get all scenes for a specific location.
   * @param {string} locationKey - The key of the location.
   * @returns {Object} Location data with scenes.
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
   * Get a specific scene from a location by sceneId.
   * @param {string} locationKey - The key of the location.
   * @param {string|number} sceneId - The scene ID.
   * @returns {Object} Scene data.
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
   * Find a scene by its sceneId within a location.
   * @param {string} locationKey - The key of the location.
   * @param {string|number} sceneId - The scene ID.
   * @returns {Object|null} The scene object or null if not found.
   */
  findSceneById(locationKey, sceneId) {
    const location = this.locations[locationKey];
    if (!location) {
      return null;
    }

    return location.scenes.find(scene => scene.sceneId === sceneId);
  }

  /**
   * Get the current scene for a user based on their game state.
   * @param {Object} gameState - The user's game state.
   * @returns {Object} The current scene data.
   */
  getCurrentScene(gameState) {
    const { currentLocation, currentSceneIds } = gameState;
    const sceneId = currentSceneIds[currentLocation];
    
    if (!sceneId) {
      const location = this.locations[currentLocation];
      if (!location || !location.scenes || location.scenes.length === 0) {
        throw new Error(`No scenes available for location ${currentLocation}`);
      }
      return this.getScene(currentLocation, location.scenes[0].sceneId);
    }
    
    return this.getScene(currentLocation, sceneId);
  }

  /**
   * Get location metadata by key.
   * @param {string} locationKey - The key of the location.
   * @returns {Object} Location metadata.
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
   * Check if a location exists.
   * @param {string} locationKey - The key of the location.
   * @returns {boolean} True if the location exists, false otherwise.
   */
  locationExists(locationKey) {
    return this.metadata && this.metadata.locations[locationKey] !== undefined;
  }

  /**
   * Get total number of scenes in a location.
   * @param {string} locationKey - The key of the location.
   * @returns {number} The number of scenes in the location.
   */
  getSceneCount(locationKey) {
    const location = this.locations[locationKey];
    return location ? location.scenes.length : 0;
  }

  /**
   * Determine the starting scene ID for a location based on restart points and game state.
   * @param {string} locationKey - The location key.
   * @param {object} gameState - The current game state containing reachedRestartPoints and gameFlags.
   * @param {string} savedSceneId - The saved scene ID from currentSceneIds.
   * @returns {string} The scene ID to start from.
   */
  getStartingSceneId(locationKey, gameState, savedSceneId) {
    const location = this.locations[locationKey];
    if (!location || !location.scenes || location.scenes.length === 0) {
      return null;
    }

    const reachedRestartPoints = gameState.reachedRestartPoints || [];
    
    const locationRestartPoints = reachedRestartPoints
      .filter(point => point.startsWith(`${locationKey}_`))
      .map(point => {
        const parts = point.split('_');
        return parts.slice(1).join('_'); 
      });

    if (locationRestartPoints.length === 0) {
      return savedSceneId || location.scenes[0].sceneId;
    }

    for (let i = locationRestartPoints.length - 1; i >= 0; i--) {
      const restartSceneId = locationRestartPoints[i];
      const restartScene = this.findSceneById(locationKey, restartSceneId);

      if (!restartScene || restartScene.startFromHereUnless === undefined) {
        continue;
      }

      if (restartScene.startFromHereUnless === '') {
        return restartSceneId;
      }

      const condition = restartScene.startFromHereUnless;
      const conditionMet = this.checkCondition(condition, gameState);

      if (conditionMet) {
        continue;
      }

      return restartSceneId;
    }

    return savedSceneId || location.scenes[0].sceneId;
  }

  /**
   * Check if a condition is met based on game state.
   * @param {string} condition - The condition to check.
   * @param {object} gameState - The current game state.
   * @returns {boolean} Whether the condition is met.
   */
  checkCondition(condition, gameState) {
    if (gameState.gameFlags && gameState.gameFlags[condition] !== undefined) {
      return gameState.gameFlags[condition] === true;
    }

    if (condition === 'investigationCompleted') {
      return gameState.investigationCompleted === true;
    }
    if (condition === 'lucasAvailable') {
      return gameState.lucasAvailable === true;
    }

    return false;
  }

  /**
   * Validate all scene references in all locations.
   * Checks that all nextScene references point to valid sceneIds.
   * @returns {object} Validation result with errors array.
   */
  validateSceneReferences() {
    const errors = [];

    for (const locationKey in this.locations) {
      const location = this.locations[locationKey];
      const sceneIds = new Set(location.scenes.map(s => s.sceneId));

      location.scenes.forEach((scene, index) => {
        if (!scene.sceneId) {
          errors.push({
            location: locationKey,
            sceneIndex: index,
            error: 'Scene missing sceneId property'
          });
        }

        const duplicates = location.scenes.filter(s => s.sceneId === scene.sceneId);
        if (duplicates.length > 1) {
          errors.push({
            location: locationKey,
            sceneId: scene.sceneId,
            error: `Duplicate sceneId found ${duplicates.length} times`
          });
        }

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

const storyService = new StoryService();
module.exports = storyService;

