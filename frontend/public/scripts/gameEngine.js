// (function() { // Removed duplicate wrapper
    

/**
 * Game Engine - Manages game state and rendering via backend API
 */

(async function() {
    // Game state (loaded from backend)
        // Solution question flow using solution.json (must be after all function/var declarations)
        async function startSolutionFlow() {
            clearAreas();
            let answers = {};
            let questions = [];
            console.log('[startSolutionFlow] Triggered');
            try {
                // Try to load questions from solution.json
                const res = await fetch('/api/story/solution');
                if (!res.ok) throw new Error('solution.json not found');
                questions = await res.json();
                console.log('[startSolutionFlow] Loaded questions:', questions);
            } catch (e) {
                console.error('[startSolutionFlow] Error loading solution.json:', e);
                dialogueEl.innerHTML = '<p>Nem található a kérdéssor (solution.json).</p>';
                return;
            }
            let idx = 0;

            async function askNext() {
                clearAreas();
                console.log('[askNext] idx:', idx, 'questions.length:', questions.length);
                if (idx >= questions.length) {
                    // Validate all required keys are present
                    const requiredKeys = ['weapon', 'killer', 'motive', 'kidnapper', 'kidnapMotive', 'ghostskin'];
                    const missing = requiredKeys.filter(k => !(k in answers));
                    if (missing.length > 0) {
                        dialogueEl.innerHTML = `<p>Hiányzó válasz(ok): ${missing.join(', ')}. Kérjük, válaszolj minden kérdésre!</p>`;
                        console.warn('[askNext] Missing required answers:', missing);
                        return;
                    }
                    // All answered, save to backend
                    try {
                        // Check authentication by making a lightweight authenticated request
                        const stateResp = await apiClient.getGameState?.();
                        if (stateResp && stateResp.success === false && stateResp.message && stateResp.message.includes('jelentkezzen be')) {
                            dialogueEl.innerHTML = '<p>A megoldás mentéséhez be kell jelentkezni. Átirányítás a bejelentkezéshez...</p>';
                            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                            return;
                        }
                        await apiClient.saveSolution(answers);
                        console.log('[askNext] Solution saved:', answers);
                        window.location.href = 'story.html';
                    } catch (e) {
                        if (e.message && e.message.includes('Nincs hitelesítve')) {
                            dialogueEl.innerHTML = '<p>A megoldás mentéséhez be kell jelentkezni. Átirányítás a bejelentkezéshez...</p>';
                            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                        } else {
                            console.error('[askNext] Error saving solution:', e);
                            dialogueEl.innerHTML = '<p>Hiba történt a mentéskor.</p>';
                        }
                    }
                    return;
                }
                const q = questions[idx];
                console.log('[askNext] Showing question:', q);
                const qDiv = document.createElement('div');
                qDiv.innerHTML = `<p style=\"font-weight:bold;\">${q.text}</p>`;

                let options = [];
                if (Array.isArray(q.options) && q.options.length > 0) {
                    options = q.options;
                } else if (q.type === 'item') {
                    options = gameState && gameState.collectedItems ? gameState.collectedItems : [];
                }
                console.log('[askNext] Options:', options);

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.textContent = opt;
                    btn.className = 'choice-bubble';
                    btn.onclick = () => {
                        answers[q.key] = opt;
                        idx++;
                        askNext();
                    };
                    qDiv.appendChild(btn);
                });

                choicesEl.appendChild(qDiv);
            }

            askNext();
        }

        // Attach to a global for triggering from UI
        window.startSolutionFlow = startSolutionFlow;

        // Optionally, add a handler for a button with id 'solveCaseBtn'
        document.addEventListener('DOMContentLoaded', function() {
            const solveBtn = document.getElementById('solveCaseBtn');
            if (solveBtn) {
                solveBtn.addEventListener('click', startSolutionFlow);
            }
        });
    let gameState = null;
    let currentLocation = null;
    let locationScenes = null;
    let locationsMetadata = null;
    let responseActive = false;

    // DOM elements
    const dialogueEl = document.getElementById('dialogue');
    const choicesEl = document.getElementById('choices');
    const characterImageEl = document.getElementById('characterImage');
    const controlsEl = document.querySelector('.controls');
    const nextButtonContainer = document.getElementById('nextButtonContainer');
    const itemsListEl = document.getElementById('itemsList');
    const locationsListEl = document.getElementById('locationsList');

    /**
     * Initialize the game
     */
    async function initializeGame() {
        try {
            // Load game state from backend
            const response = await apiClient.getGameState();
            gameState = response.gameState;
            
            // Load locations metadata
            const locationsResponse = await apiClient.getLocations();
            locationsMetadata = locationsResponse.locations;

            // Load current location scenes
            await loadLocation(gameState.currentLocation);

            // Render current scene
            await renderCurrentScene();

            // Setup location buttons
            setupLocationButtons();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            alert('Hiba történt a játék betöltése során.');
        }
    }

    /**
     * Load a location's scenes from backend
     */
    async function loadLocation(locationKey) {
        try {
            const response = await apiClient.getLocationScenes(locationKey);
            currentLocation = response.location.locationKey;
            locationScenes = response.location.scenes;
            
            // Update background
            updateBackground(response.location.backgroundImage);
        } catch (error) {
            console.error(`Failed to load location ${locationKey}:`, error);
            throw error;
        }
    }

    /**
     * Update background image
     */
    function updateBackground(backgroundImage) {
        document.body.style.backgroundImage = `url('${backgroundImage}')`;
    }

    /**
     * Get current scene ID for current location
     */
    function getCurrentSceneId() {
        return gameState.currentSceneIds[currentLocation];
    }

    /**
     * Get current scene
     */
    function getCurrentScene() {
        const sceneId = getCurrentSceneId();
        if (!locationScenes || locationScenes.length === 0) {
            return null;
        }
        
        // If no sceneId set, return first scene
        if (!sceneId) {
            return locationScenes[0];
        }
        
        // Find scene by sceneId
        return locationScenes.find(scene => scene.sceneId === sceneId) || null;
    }

    /**
     * Render the current scene
     */
    async function renderCurrentScene() {
        const scene = getCurrentScene();
        const sceneId = getCurrentSceneId();
        
        // Check if we've reached the end of scenes
        if (!scene) {
            console.warn('No more scenes available in this location');
            return;
        }
        
        // Check if scene should be skipped (once scenes already seen)
        if (scene.once) {
            const sceneMarker = `${currentLocation}_${scene.sceneId}`;
            if (gameState.seenOnceScenes.includes(sceneMarker)) {
                // Skip to next scene
                await progressToNextScene();
                return;
            } else {
                // Mark as seen
                await apiClient.updateGameState({
                    seenOnceScenes: [...gameState.seenOnceScenes, sceneMarker]
                });
                gameState.seenOnceScenes.push(sceneMarker);
            }
        }

        // Check if this is a restart point (startFromHereUnless property exists)
        if (scene.startFromHereUnless !== undefined) {
            const restartPointId = `${currentLocation}_${scene.sceneId}`;
            if (!gameState.reachedRestartPoints.includes(restartPointId)) {
                // Mark this restart point as reached
                await apiClient.markRestartPoint(currentLocation, scene.sceneId);
                gameState.reachedRestartPoints.push(restartPointId);
            }
        }

        // Check conditions - find next valid scene if condition not met
        if (scene.condition && !checkCondition(scene.condition)) {
            // Find the next scene that either has no condition or has a met condition
            await findNextValidScene(scene.sceneId);
            return;
        }

        clearAreas();
        updateItemsList();

        // Handle scene actions FIRST (before rendering)
        if (scene.setState) {
            await apiClient.setFlags(scene.setState);
            Object.assign(gameState.gameFlags, scene.setState);
        }

        if (scene.addItem) {
            await apiClient.collectItem(scene.addItem);
            if (!gameState.collectedItems.includes(scene.addItem)) {
                gameState.collectedItems.push(scene.addItem);
            }
            updateItemsList();
        }

        if (scene.removeItem) {
            await apiClient.removeItem(scene.removeItem);
            const index = gameState.collectedItems.indexOf(scene.removeItem);
            if (index > -1) gameState.collectedItems.splice(index, 1);
            updateItemsList();
        }

        if (scene.location) {
            // Convert display name to location key
            const locationKey = getLocationKeyFromName(scene.location);
            await apiClient.discoverLocation(locationKey);
            if (!gameState.discoveredLocations.includes(locationKey)) {
                gameState.discoveredLocations.push(locationKey);
                setupLocationButtons();
            }
        }

        // Handle redirect actions
        if (scene.action === 'redirect' && scene.redirectUrl) {
            window.location.href = scene.redirectUrl;
            return;
        }

        // Handle different scene types
        if (scene.type === 'narrative') {
            renderNarrative(scene);
        } else if (scene.type === 'choices') {
            renderChoices(scene);
        } else if (scene.type === 'investigation') {
            renderInvestigation(scene);
        } else if (scene.type === 'evidence_choices') {
            renderEvidenceChoices(scene);
        }
    }

    /**
     * Render narrative scene
     */
    function renderNarrative(scene) {
        const p = document.createElement('p');
        p.textContent = scene.text;
        dialogueEl.appendChild(p);

        // Show character image if present
        if (scene.image) {
            const img = document.createElement('img');
            img.src = scene.image;
            img.alt = 'Character';
            characterImageEl.appendChild(img);
        }

        // Add next button - either to specific scene or next sequential scene
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Következő';
        nextBtn.className = 'next-btn';

        if (scene.action === 'redirect' && scene.redirectUrl) {
            // On click, redirect to the given URL
            nextBtn.addEventListener('click', () => {
                window.location.href = scene.redirectUrl;
            });
        } else if (scene.autoSwitch && scene.location) {
            nextBtn.addEventListener('click', async () => {
                const locationKey = getLocationKeyFromName(scene.location);
                await switchLocation(locationKey, true);
            });
        } else if (scene.nextScene !== undefined) {
            // Go to specific scene by sceneId
            nextBtn.addEventListener('click', () => progressToSceneById(scene.nextScene));
        } else {
            // Go to next sequential scene
            nextBtn.addEventListener('click', progressToNextScene);
        }

        nextButtonContainer.appendChild(nextBtn);
    }

    /**
     * Render choices scene
     */
    function renderChoices(scene) {
        // Add prompt to choices section first
        if (scene.prompt) {
            const promptP = document.createElement('p');
            promptP.textContent = scene.prompt;
            promptP.style.fontWeight = 'bold';
            promptP.style.marginBottom = '12px';
            choicesEl.appendChild(promptP);
        }

        if (scene.image) {
            const img = document.createElement('img');
            img.src = scene.image;
            characterImageEl.appendChild(img);
        }

        // Render choices
        scene.choices.forEach(choice => {
            // Check conditions
            if (choice.condition && !checkCondition(choice.condition)) {
                return;
            }

            // Check item requirements
            if (choice.requiresItem && !gameState.collectedItems.includes(choice.requiresItem)) {
                return;
            }

            const button = document.createElement('button');
            button.textContent = choice.label;
            button.className = 'choice-bubble';
            button.addEventListener('click', () => handleChoice(choice));
            choicesEl.appendChild(button);
        });

        // Evidence prompt - shows as disabled button to indicate items are clickable
        if (scene.evidencePrompt) {
            const evidenceBtn = document.createElement('button');
            evidenceBtn.textContent = scene.evidencePrompt;
            evidenceBtn.className = 'evidence-prompt-btn';
            evidenceBtn.disabled = true;
            choicesEl.appendChild(evidenceBtn);
        }
    }

    /**
     * Render investigation scene
     */
    function renderInvestigation(scene) {
        // Create image container with white border
        const imageContainer = document.createElement('div');
        imageContainer.style.background = '#ffffff';
        imageContainer.style.border = '3px solid #8b7355';
        imageContainer.style.borderRadius = '10px';
        imageContainer.style.padding = '40px';
        imageContainer.style.margin = '30px auto';
        imageContainer.style.maxWidth = '95%';
        imageContainer.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.4)';
        imageContainer.style.display = 'flex';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.alignItems = 'center';

        const img = document.createElement('img');
        img.src = scene.image;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '5px';
        imageContainer.appendChild(img);

        dialogueEl.appendChild(imageContainer);

        const finishBtn = document.createElement('button');
        finishBtn.textContent = scene.buttonLabel || 'Befejezés';
        finishBtn.className = 'choice-bubble';
        finishBtn.addEventListener('click', async () => {
            await apiClient.setFlags({ investigationCompleted: true });
            gameState.gameFlags.investigationCompleted = true;
            progressToSceneById(scene.nextScene);
        });
        choicesEl.appendChild(finishBtn);
    }

    /**
     * Render evidence choices scene
     */
    function renderEvidenceChoices(scene) {
        // Add prompt to choices section first
        if (scene.prompt) {
            const promptP = document.createElement('p');
            promptP.textContent = scene.prompt;
            promptP.style.fontWeight = 'bold';
            promptP.style.marginBottom = '12px';
            choicesEl.appendChild(promptP);
        }

        if (scene.image) {
            const img = document.createElement('img');
            img.src = scene.image;
            characterImageEl.appendChild(img);
        }

        scene.choices.forEach(choice => {
            if (choice.requiresItem && !gameState.collectedItems.includes(choice.requiresItem)) {
                return;
            }

            const button = document.createElement('button');
            button.textContent = choice.label;
            button.className = 'choice-bubble';
            button.addEventListener('click', () => handleChoice(choice));
            choicesEl.appendChild(button);
        });
    }

    /**
     * Handle user choice
     */
    async function handleChoice(choice) {
        if (responseActive) return;
        responseActive = true;

        // Ha a choice autoSwitch és location mezőt tartalmaz, válts helyszínt

        // Special case: if the current scene is 'case_solved_question' and the player selects 'Igen, megoldom az ügyet.'
        const currentScene = getCurrentScene();
        // Nyomornegyed döntés mentése accepted_help/declined_help értékkel
        if (currentScene && currentScene.sceneId === 'nyomornegyed_clue_choice') {
            let decision = null;
            if (choice.id === 'accept_offer') {
                decision = 'accepted_help';
            } else if (choice.id === 'thank_but_no') {
                decision = 'declined_help';
            }
            if (decision) {
                await apiClient.updateGameState({ nyomornegyed_decision: decision });
            }
        }

        if (currentScene && currentScene.sceneId === 'case_solved_question' && choice.label === 'Igen, megoldom az ügyet.') {
            await window.startSolutionFlow();
        } else if (choice.autoSwitch && choice.location) {
            const locationKey = getLocationKeyFromName(choice.location);
            // Skip confirmation for autoSwitch
            await switchLocation(locationKey, true);
            // Ha nextScene is van, lépj arra a jelenetre az új helyszínen
            if (choice.nextScene !== undefined) {
                await progressToSceneById(choice.nextScene);
            }
        } else if (choice.nextScene !== undefined) {
            await progressToSceneById(choice.nextScene);
        }

        responseActive = false;
    }

    /**
     * Progress to next scene (sequential progression)
     */
    async function progressToNextScene() {
        const currentScene = getCurrentScene();
        if (!currentScene) {
            console.warn('No current scene to progress from');
            return;
        }
        
        // Find current scene index in array
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        const nextIndex = currentIndex + 1;
        
        // Check if next scene exists
        if (nextIndex >= locationScenes.length) {
            console.warn('No more scenes available in this location');
            return;
        }
        
        // Progress to next scene by its sceneId
        await progressToSceneById(locationScenes[nextIndex].sceneId);
    }

    /**
     * Find the next valid scene (skips scenes with unmet conditions)
     */
    async function findNextValidScene(currentSceneId) {
        // Find current scene index in array
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentSceneId);
        
        // Search from next scene onwards for a scene that can be shown
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            const scene = locationScenes[i];
            
            // If scene has no condition, or condition is met, go to it
            if (!scene.condition || checkCondition(scene.condition)) {
                await progressToSceneById(scene.sceneId);
                return;
            }
        }
        
        // If no valid scene found, log warning
        console.warn('No valid scene found with met conditions');
    }

    /**
     * Progress to specific scene by sceneId
     */
    async function progressToSceneById(sceneId) {
        try {
            // Update backend
            const response = await apiClient.progressScene(currentLocation, sceneId);
            gameState = response.gameState;

            // Render new scene
            await renderCurrentScene();
        } catch (error) {
            console.error('Failed to progress scene:', error);
        }
    }

    /**
     * Switch to a different location
     */
    async function switchLocation(locationKey, skipConfirmation = false) {
        try {
            if (!gameState.gameFlags) gameState.gameFlags = {};

            // Location change confirmation
            if (!skipConfirmation) {
                // Show confirmation scene before switching
                clearAreas();
                // Use current location's background
                updateBackground(locationsMetadata && locationsMetadata[currentLocation]?.backgroundImage || '');
                const box = document.createElement('div');
                box.style.background = '#ffffff';
                box.style.border = '3px solid #8b7355';
                box.style.borderRadius = '10px';
                box.style.padding = '40px';
                box.style.margin = '30px auto';
                box.style.maxWidth = '95%';
                box.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.4)';
                box.style.display = 'flex';
                box.style.flexDirection = 'column';
                box.style.alignItems = 'center';

                const p = document.createElement('p');
                p.textContent = 'Biztos el akarod hagyni a helyszínt?';
                p.style.fontWeight = 'bold';
                p.style.marginBottom = '24px';
                box.appendChild(p);

                const btnContainer = document.createElement('div');
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '24px';

                const btnYes = document.createElement('button');
                btnYes.textContent = 'Igen';
                btnYes.className = 'choice-bubble';
                btnYes.style.minWidth = '120px';
                btnYes.addEventListener('click', async () => {
                    await switchLocation(locationKey, true);
                });
                const btnNo = document.createElement('button');
                btnNo.textContent = 'Nem';
                btnNo.className = 'choice-bubble';
                btnNo.style.minWidth = '120px';
                btnNo.addEventListener('click', async () => {
                    // Re-render current scene, stay here
                    await renderCurrentScene();
                });
                btnContainer.appendChild(btnYes);
                btnContainer.appendChild(btnNo);
                box.appendChild(btnContainer);

                dialogueEl.appendChild(box);
                return;
            }

            if (locationKey === 'nyomornegyed') {
                if (gameState.gameFlags.nyomornegyedVisited) {
                    await loadLocation(locationKey);
                    clearAreas();
                    updateBackground('pictures/nyomornegyed.png');
                    const p = document.createElement('p');
                    p.textContent = 'A nyomornegyedbe túl veszélyes visszatérni. Jobb, ha inkább hazamész.';
                    dialogueEl.appendChild(p);
                    const nextBtn = document.createElement('button');
                    nextBtn.textContent = 'Következő';
                    nextBtn.className = 'next-btn';
                    nextBtn.addEventListener('click', async () => {
                        await switchLocation('otthon', true);
                    });
                    nextButtonContainer.appendChild(nextBtn);
                    return;
                } else {
                    gameState.gameFlags.nyomornegyedVisited = true;
                    await apiClient.setFlags({ nyomornegyedVisited: true });
                }
            }

            // Load new location
            await loadLocation(locationKey);

            // Get the starting scene ID based on restart points
            const startingSceneResponse = await apiClient.getStartingScene(locationKey);
            const startingSceneId = startingSceneResponse.startingSceneId;

            // Update game state with new location and starting scene
            const response = await apiClient.updateGameState({
                currentLocation: locationKey,
            });
            gameState = response.gameState;

            // Set the scene to the starting scene
            await apiClient.progressScene(locationKey, startingSceneId);
            gameState.currentSceneIds[locationKey] = startingSceneId;

            // Update location buttons to highlight current location
            setupLocationButtons();

            // Render starting scene of new location
            await renderCurrentScene();
        } catch (error) {
            console.error(`Failed to switch to location ${locationKey}:`, error);
        }
    }

    /**
     * Get location key from display name
     */
    function getLocationKeyFromName(displayName) {
        if (!locationsMetadata) return displayName;
        
        // Map of display names to keys
        const nameToKey = {
            'Otthon': 'otthon',
            'Városi park': 'varosipark',
            'Báró birtoka': 'barobirtoka',
            'Piac': 'piac',
            'Városi őrség': 'rendorseg',
            'Charlotte szobája': 'charlotteszoba',
            'Nyomornegyed': 'nyomornegyed'
        };
        
        return nameToKey[displayName] || displayName;
    }

    /**
     * Check condition
     */
    function checkCondition(condition) {
        // Special conditions
        if (condition === 'investigationCompleted') {
            return gameState.gameFlags.investigationCompleted === true;
        }
        if (condition === 'investigationCompletedCharlotte') {
            return gameState.gameFlags.investigationCompletedCharlotte === true;
        }
        if (condition === 'lucasAvailable') {
            return gameState.gameFlags.lucasAvailable === true;
        }
        if (condition === 'baronAvailable') {
            return gameState.gameFlags.baronAvailable === true;
        }
        if (condition === 'baronTalked') {
            return gameState.gameFlags.baronTalked === true;
        }
        if (condition === 'piacIncidentHeard') {
            return gameState.gameFlags.piacIncidentHeard === true;
        }
        if (condition === 'notAbandonedGame') {
            return gameState.gameFlags.piacMerchantAngry !== true;
        }
        if (condition === 'notAbandonedGame2') {
            return gameState.gameFlags.game2Abandoned !== true;
        }
        if (condition === 'game2Success') {
            return gameState.gameFlags.game2Success === true;
        }
        if (condition === 'game2Failure') {
            return gameState.gameFlags.game2Failure === true;
        }
        if (condition === 'ghostskinInfoNeeded') {
            return gameState.gameFlags.ghostskinInfoNeeded === true;
        }

        // Default: check if flag exists and is truthy
        return gameState.gameFlags[condition] === true;
    }

    /**
     * Update items list display
     */
    function updateItemsList() {
        if (!itemsListEl) return;
        itemsListEl.innerHTML = '';

        const scene = getCurrentScene();
        const evidenceActive = scene && scene.evidencePrompt;

        gameState.collectedItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'item';
            li.textContent = item;

            if (evidenceActive) {
                li.classList.add('active');
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => handleItemClick(item));
            } else {
                li.style.cursor = 'default';
            }

            itemsListEl.appendChild(li);
        });
    }

    /**
     * Handle item click when evidence prompt is active
     */
    function handleItemClick(itemName) {
        const currentScene = getCurrentScene();
        
        console.log('Item clicked:', itemName);
        console.log('Current scene ID:', currentScene?.sceneId);
        
        // Find current scene index in array
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        
        // Find next evidence_choices scene
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            if (locationScenes[i].type === 'evidence_choices') {
                console.log('Found evidence_choices scene at sceneId:', locationScenes[i].sceneId);
                
                // Find the matching choice for this item in the evidence_choices scene
                const evidenceScene = locationScenes[i];
                console.log('Evidence choices:', evidenceScene.choices);
                
                const matchingChoice = evidenceScene.choices.find(choice => {
                    console.log('Checking choice:', choice.label, 'requiresItem:', choice.requiresItem);
                    return choice.requiresItem && choice.requiresItem === itemName;
                });
                
                console.log('Matching choice found:', matchingChoice);
                
                if (matchingChoice && matchingChoice.nextScene !== undefined) {
                    console.log('Jumping to scene:', matchingChoice.nextScene);
                    // Jump directly to the response scene for this item
                    progressToSceneById(matchingChoice.nextScene);
                    return;
                }
                
                // If no matching choice found, do nothing (item has no evidence text)
                console.log('No matching choice for this item - ignoring click');
                return;
            }
        }
        
        console.warn('No evidence_choices scene found after current scene');
    }

    /**
     * Show evidence choices (find next evidence_choices scene)
     */
    function showEvidenceChoices() {
        const currentScene = getCurrentScene();
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        
        // Find next evidence_choices scene
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            if (locationScenes[i].type === 'evidence_choices') {
                progressToSceneById(locationScenes[i].sceneId);
                return;
            }
        }
    }

    /**
     * Setup location buttons
     */
    function setupLocationButtons() {
        if (!locationsListEl) return;

        // Clear existing locations
        locationsListEl.innerHTML = '';

        // Create location items for discovered locations
        gameState.discoveredLocations.forEach(locationKey => {
            const metadata = locationsMetadata[locationKey];
            if (!metadata) return;

            const li = document.createElement('li');
            li.textContent = metadata.displayName;
            li.className = 'location-item';
            
            // Mark current location as active
            if (locationKey === currentLocation) {
                li.classList.add('active');
            }
            
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => switchLocation(locationKey));
            locationsListEl.appendChild(li);
        });
    }

    /**
     * Clear display areas
     */
    function clearAreas() {
        if (dialogueEl) {
            // Clear all children except the choices element
            const children = Array.from(dialogueEl.children);
            children.forEach(child => {
                if (child.id !== 'choices') {
                    child.remove();
                }
            });
        }
        // Clear choices content separately
        const choicesElement = document.getElementById('choices');
        if (choicesElement) choicesElement.innerHTML = '';
        
        if (characterImageEl) characterImageEl.innerHTML = '';
        if (nextButtonContainer) nextButtonContainer.innerHTML = '';
    }

    // Initialize game when page loads
    initializeGame();

    // Export for mini-games to access
    window.gameEngine = {
        getGameState: () => gameState,
        refreshState: initializeGame,
        apiClient: apiClient,
    };
})();

