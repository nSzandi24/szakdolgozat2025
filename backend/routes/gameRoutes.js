const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
router.use(authMiddleware);
const gameStateService = require('../services/gameStateService');
const storyService = require('../services/storyService');
const solutionService = require('../services/solutionService');
/**
 * POST /api/game/solution
 * Save player's answers to the case-solving questions
 * Body: { weapon, killer, motive, kidnapper, kidnapMotive, ghostskin }
 */
router.post('/solution', async (req, res) => {
  try {
    const userId = req.userId;
    const { weapon, killer, motive, kidnapper, kidnapMotive, ghostskin } = req.body;
    if (!weapon || !killer || !motive || !kidnapper || !kidnapMotive || !ghostskin) {
      return res.status(400).json({ success: false, message: 'Minden válasz kötelező.' });
    }
    await solutionService.saveSolution(userId, { weapon, killer, motive, kidnapper, kidnapMotive, ghostskin });
    res.json({ success: true, message: 'Megoldás sikeresen elmentve.' });
  } catch (error) {
    console.error('Error saving solution:', error);
    res.status(500).json({ success: false, message: 'Hiba történt a megoldás mentésekor.' });
  }
});

// All game routes require authentication
router.use(authMiddleware);

/**
 * GET /api/game/state
 * Get user's complete game state
 */
router.get('/state', async (req, res) => {
  try {
    const gameState = await gameStateService.getGameState(req.userId);
    
    // Also include current scene
    const currentScene = storyService.getCurrentScene(gameState);
    
    res.json({
      success: true,
      gameState,
      currentScene,
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a játékállapot lekérése során.',
    });
  }
});

/**
 * POST /api/game/initialize
 * Initialize/reset game for user
 */
router.post('/initialize', async (req, res) => {
  try {
    const gameState = await gameStateService.initializeGame(req.userId);
    const currentScene = storyService.getCurrentScene(gameState);
    
    res.json({
      success: true,
      message: 'Játék sikeresen inicializálva.',
      gameState,
      currentScene,
    });
  } catch (error) {
    console.error('Error initializing game:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a játék inicializálása során.',
    });
  }
});

/**
 * POST /api/game/update
 * Update game state with partial updates
 */
router.post('/update', async (req, res) => {
  try {
    const updates = req.body;
    const gameState = await gameStateService.updateGameState(req.userId, updates);
    const currentScene = storyService.getCurrentScene(gameState);
    
    res.json({
      success: true,
      message: 'Játékállapot frissítve.',
      gameState,
      currentScene,
    });
  } catch (error) {
    console.error('Error updating game state:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a játékállapot frissítése során.',
    });
  }
});

/**
 * POST /api/game/progress
 * Progress to a specific scene
 */
router.post('/progress', async (req, res) => {
  try {
    const { locationKey, sceneId } = req.body;
    
    if (!locationKey || !sceneId) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméterek: locationKey és sceneId szükséges.',
      });
    }

    const gameState = await gameStateService.progressScene(
      req.userId,
      locationKey,
      sceneId
    );
    const currentScene = storyService.getCurrentScene(gameState);
    
    res.json({
      success: true,
      message: 'Jelenet váltás sikeres.',
      gameState,
      currentScene,
    });
  } catch (error) {
    console.error('Error progressing scene:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a jelenet váltás során.',
    });
  }
});

/**
 * POST /api/game/collect-item
 * Add item to inventory
 */
router.post('/collect-item', async (req, res) => {
  try {
    const { itemName } = req.body;
    
    if (!itemName) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméter: itemName szükséges.',
      });
    }

    const gameState = await gameStateService.collectItem(req.userId, itemName);
    
    res.json({
      success: true,
      message: `${itemName} hozzáadva a tárgyakhoz.`,
      gameState,
    });
  } catch (error) {
    console.error('Error collecting item:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a tárgy hozzáadása során.',
    });
  }
});

/**
 * POST /api/game/remove-item
 * Remove item from inventory
 */
router.post('/remove-item', async (req, res) => {
  try {
    const { itemName } = req.body;
    
    if (!itemName) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméter: itemName szükséges.',
      });
    }

    const gameState = await gameStateService.removeItem(req.userId, itemName);
    
    res.json({
      success: true,
      message: `${itemName} eltávolítva a tárgyak közül.`,
      gameState,
    });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a tárgy eltávolítása során.',
    });
  }
});

/**
 * POST /api/game/set-flag
 * Set game flag(s)
 */
router.post('/set-flag', async (req, res) => {
  try {
    const flags = req.body;
    
    if (!flags || Object.keys(flags).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó flag értékek.',
      });
    }

    const gameState = await gameStateService.setFlags(req.userId, flags);
    
    res.json({
      success: true,
      message: 'Flag-ek beállítva.',
      gameState,
    });
  } catch (error) {
    console.error('Error setting flags:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a flag-ek beállítása során.',
    });
  }
});

/**
 * POST /api/game/discover-location
 * Unlock a new location
 */
router.post('/discover-location', async (req, res) => {
  try {
    const { locationKey } = req.body;
    
    if (!locationKey) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméter: locationKey szükséges.',
      });
    }

    const gameState = await gameStateService.discoverLocation(req.userId, locationKey);
    
    res.json({
      success: true,
      message: `${locationKey} helyszín feloldva.`,
      gameState,
    });
  } catch (error) {
    console.error('Error discovering location:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a helyszín feloldása során.',
    });
  }
});

/**
 * POST /api/game/mark-restart-point
 * Mark a restart point as reached
 */
router.post('/mark-restart-point', async (req, res) => {
  try {
    const { locationKey, sceneId } = req.body;
    
    if (!locationKey || !sceneId) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméterek: locationKey és sceneId szükséges.',
      });
    }

    const gameState = await gameStateService.markRestartPointReached(
      req.userId,
      locationKey,
      sceneId
    );
    
    res.json({
      success: true,
      message: 'Újraindítási pont elérve.',
      gameState,
    });
  } catch (error) {
    console.error('Error marking restart point:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt az újraindítási pont mentése során.',
    });
  }
});

/**
 * POST /api/game/mini-game/complete
 * Record mini-game completion
 */
router.post('/mini-game/complete', async (req, res) => {
  try {
    const { gameId, success, updates } = req.body;
    
    if (!gameId || success === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Hiányzó paraméterek: gameId és success szükséges.',
      });
    }

    const gameState = await gameStateService.completeMiniGame(
      req.userId,
      gameId,
      success,
      updates || {}
    );
    
    res.json({
      success: true,
      message: success ? 'Mini játék sikeresen teljesítve!' : 'Mini játék befejezve.',
      gameState,
    });
  } catch (error) {
    console.error('Error completing mini-game:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a mini játék befejezése során.',
    });
  }
});

/**
 * DELETE /api/game/reset
 * Reset game progress
 */
router.delete('/reset', async (req, res) => {
  try {
    const gameState = await gameStateService.resetProgress(req.userId);
    const currentScene = storyService.getCurrentScene(gameState);
    
    res.json({
      success: true,
      message: 'Játék állapot visszaállítva.',
      gameState,
      currentScene,
    });
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({
      success: false,
      message: 'Hiba történt a játék visszaállítása során.',
    });
  }
});

module.exports = router;

