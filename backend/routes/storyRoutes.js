const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
/**
 * GET /api/story/solution
 * Serve the solution.json file (question flow).
 * @route GET /api/story/solution
 * @returns {Object} JSON response with the solution question flow
 */
router.get('/solution', (req, res) => {
  const solutionPath = path.join(__dirname, '../story/locations/solution.json');
  fs.readFile(solutionPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading solution.json:', err);
      return res.status(404).json({ success: false, message: 'solution.json not found' });
    }
    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (parseErr) {
      console.error('Error parsing solution.json:', parseErr);
      res.status(500).json({ success: false, message: 'Invalid solution.json' });
    }
  });
});
const storyService = require('../services/storyService');
const gameStateService = require('../services/gameStateService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * GET /api/story/locations
 * Get all locations metadata.
 * @route GET /api/story/locations
 * @returns {Object} JSON response with locations metadata
 */
router.get('/locations', (req, res) => {
  try {
    const locations = storyService.getLocationsMetadata();
    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error('Error getting locations:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a helyszínek lekérése során.',
    });
  }
});

/**
 * GET /api/story/:locationKey
 * Get all scenes for a specific location.
 * @route GET /api/story/:locationKey
 * @param {string} locationKey - The key of the location
 * @returns {Object} JSON response with location data
 */
router.get('/:locationKey', (req, res) => {
  try {
    const { locationKey } = req.params;
    const locationData = storyService.getLocationScenes(locationKey);
    
    res.json({
      success: true,
      location: locationData,
    });
  } catch (error) {
    console.error(`Error getting location ${req.params.locationKey}:`, error);
    res.status(404).json({
      success: false,
      message: 'A kért helyszín nem található.',
    });
  }
});

/**
 * GET /api/story/:locationKey/:sceneIndex
 * Get a specific scene from a location.
 * @route GET /api/story/:locationKey/:sceneIndex
 * @param {string} locationKey - The key of the location
 * @param {number} sceneIndex - The index of the scene
 * @returns {Object} JSON response with scene data
 */
router.get('/:locationKey/:sceneIndex', (req, res) => {
  try {
    const { locationKey, sceneIndex } = req.params;
    const sceneData = storyService.getScene(locationKey, parseInt(sceneIndex));
    
    res.json({
      success: true,
      scene: sceneData,
    });
  } catch (error) {
    console.error(`Error getting scene ${req.params.locationKey}/${req.params.sceneIndex}:`, error);
    res.status(404).json({
      success: false,
      message: 'A kért jelenet nem található.',
    });
  }
});

/**
 * POST /api/story/starting-scene
 * Get the starting scene ID for a location based on restart points.
 * @route POST /api/story/starting-scene
 * @body {string} locationKey
 * @returns {Object} JSON response with startingSceneId and savedSceneId
 */
router.post('/starting-scene', async (req, res) => {
  try {
    const { locationKey } = req.body;
    
    if (!locationKey) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméter: locationKey szükséges.',
      });
    }

    const gameState = await gameStateService.getGameState(req.userId);
    const savedSceneId = gameState.currentSceneIds[locationKey];
    
    const startingSceneId = storyService.getStartingSceneId(
      locationKey,
      gameState,
      savedSceneId
    );
    
    res.json({
      success: true,
      startingSceneId,
      savedSceneId,
    });
  } catch (error) {
    console.error('Error getting starting scene:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a kezdő jelenet meghatározása során.',
    });
  }
});

/**
 * GET /api/story/validate
 * Validate all scene references in all locations.
 * @route GET /api/story/validate
 * @returns {Object} JSON response with validation result
 */
router.get('/validate', (req, res) => {
  try {
    const validationResult = storyService.validateSceneReferences();
    
    if (validationResult.valid) {
      res.json({
        success: true,
        message: 'All scene references are valid!',
        validationResult,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Found ${validationResult.errors.length} validation errors.`,
        validationResult,
      });
    }
  } catch (error) {
    console.error('Error validating scene references:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a validáció során.',
    });
  }
});

module.exports = router;

