    

/**
 * Game Engine - Manages game state and rendering via backend API
 */

(async function() {
        document.addEventListener('DOMContentLoaded', async function() {
            const notesTextarea = document.getElementById('playerNotes');
            const saveBtn = document.getElementById('saveNotesBtn');
            const statusSpan = document.getElementById('notesSaveStatus');
            try {
                const state = await apiClient.getGameState();
                if (state && state.gameState && typeof state.gameState.notes === 'string') {
                    notesTextarea.value = state.gameState.notes;
                }
            } catch (e) {
                statusSpan.textContent = 'Nem sikerült betölteni a jegyzetet.';
            }
            saveBtn.addEventListener('click', async () => {
                const notes = notesTextarea.value;
                try {
                    await apiClient.updateGameState({ notes });
                    statusSpan.textContent = 'Jegyzet mentve!';
                } catch (e) {
                    statusSpan.textContent = 'Mentés sikertelen.';
                }
            });
        });
    let addMinutes, loadTimeFromBackend, setTime;
    try {
        const timeModule = await import('./time.constans.js');
        addMinutes = timeModule.addMinutes;
        loadTimeFromBackend = timeModule.loadTimeFromBackend;
        setTime = timeModule.setTime;
        window.addMinutes = addMinutes;
        window.loadTimeFromBackend = loadTimeFromBackend;
        window.setTime = setTime;
    } catch (e) {
        console.error('Failed to load time.constans.js:', e);
        addMinutes = () => {};
        loadTimeFromBackend = async () => {};
        setTime = () => {};
    }

        async function startSolutionFlow() {
            clearAreas();
            let answers = {};
            let questions = [];
            console.log('[startSolutionFlow] Triggered');
            try {
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
                    const requiredKeys = ['weapon', 'killer', 'motive', 'kidnapper', 'kidnapMotive', 'ghostskin'];
                    const missing = requiredKeys.filter(k => !(k in answers));
                    if (missing.length > 0) {
                        dialogueEl.innerHTML = `<p>Hiányzó válasz(ok): ${missing.join(', ')}. Kérjük, válaszolj minden kérdésre!</p>`;
                        console.warn('[askNext] Missing required answers:', missing);
                        return;
                    }
                    try {
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

        window.startSolutionFlow = startSolutionFlow;

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

    const dialogueEl = document.getElementById('dialogue');
    const choicesEl = document.getElementById('choices');
    const characterImageEl = document.getElementById('characterImage');
    const controlsEl = document.querySelector('.controls');
    const nextButtonContainer = document.getElementById('nextButtonContainer');
    const itemsListEl = document.getElementById('itemsList');
    const locationsListEl = document.getElementById('locationsList');

    /**
     * Initializes the game by loading game state, time, locations, and rendering the current scene.
     * Sets up location buttons and handles errors during initialization.
     * @async
     * @function initializeGame
     */
    async function initializeGame() {
        try {
            const response = await apiClient.getGameState();
            gameState = response.gameState;
            await loadTimeFromBackend();

            const locationsResponse = await apiClient.getLocations();
            locationsMetadata = locationsResponse.locations;

            await loadLocation(gameState.currentLocation);

            await renderCurrentScene();

            setupLocationButtons();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            alert('Hiba történt a játék betöltése során.');
        }
    }

    /**
     * Loads a location's scenes and updates the background image.
     * @async
     * @param {string} locationKey - The key of the location to load.
     * @function loadLocation
     */
    async function loadLocation(locationKey) {
        try {
            const response = await apiClient.getLocationScenes(locationKey);
            currentLocation = response.location.locationKey;
            locationScenes = response.location.scenes;
            
            updateBackground(response.location.backgroundImage);
        } catch (error) {
            console.error(`Failed to load location ${locationKey}:`, error);
            throw error;
        }
    }

    /**
     * Updates the background image of the game.
     * @param {string} backgroundImage - The URL of the background image.
     * @function updateBackground
     */
    function updateBackground(backgroundImage) {
        document.body.style.backgroundImage = `url('${backgroundImage}')`;
    }

    /**
     * Gets the current scene ID for the current location.
     * @returns {string} The current scene ID.
     * @function getCurrentSceneId
     */
    function getCurrentSceneId() {
        return gameState.currentSceneIds[currentLocation];
    }

    /**
     * Gets the current scene object for the current location.
     * @returns {Object|null} The current scene object or null if not found.
     * @function getCurrentScene
     */
    function getCurrentScene() {
        const sceneId = getCurrentSceneId();
        if (!locationScenes || locationScenes.length === 0) {
            return null;
        }
        
        if (!sceneId) {
            return locationScenes[0];
        }
        
        return locationScenes.find(scene => scene.sceneId === sceneId) || null;
    }

    /**
     * Renders the current scene based on its type and updates the UI accordingly.
     * Handles scene progression, state updates, and item management.
     * @async
     * @function renderCurrentScene
     */
    async function renderCurrentScene() {
        const scene = getCurrentScene();
        const sceneId = getCurrentSceneId();
        
        if (!scene) {
            console.warn('No more scenes available in this location');
            return;
        }
        
        if (scene.once) {
            const sceneMarker = `${currentLocation}_${scene.sceneId}`;
            if (gameState.seenOnceScenes.includes(sceneMarker)) {
                await progressToNextScene();
                return;
            } else {
                await apiClient.updateGameState({
                    seenOnceScenes: [...gameState.seenOnceScenes, sceneMarker]
                });
                gameState.seenOnceScenes.push(sceneMarker);
            }
        }

        if (scene.startFromHereUnless !== undefined) {
            const restartPointId = `${currentLocation}_${scene.sceneId}`;
            if (!gameState.reachedRestartPoints.includes(restartPointId)) {
                await apiClient.markRestartPoint(currentLocation, scene.sceneId);
                gameState.reachedRestartPoints.push(restartPointId);
            }
        }

        if (scene.condition && !checkCondition(scene.condition)) {
            await findNextValidScene(scene.sceneId);
            return;
        }

        clearAreas();
        updateItemsList();

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
            const locationKey = getLocationKeyFromName(scene.location);
            await apiClient.discoverLocation(locationKey);
            if (!gameState.discoveredLocations.includes(locationKey)) {
                gameState.discoveredLocations.push(locationKey);
                setupLocationButtons();
            }
        }

        if (scene.action === 'redirect' && scene.redirectUrl) {
            window.location.href = scene.redirectUrl;
            return;
        }

        if (scene.type === 'narrative') {
            renderNarrative(scene);
        } else if (scene.type === 'choices') {
            renderChoices(scene);
        } else if (scene.type === 'investigation') {
            renderInvestigation(scene);
        } else if (scene.type === 'evidence_choices') {
            renderEvidenceChoices(scene);
        } else if (scene.type === 'location_examine') {
            const examineBtn = document.createElement('button');
            examineBtn.textContent = 'Helyszín átnézése';
            examineBtn.className = 'choice-bubble';
            examineBtn.addEventListener('click', () => {
                addMinutes(20); 
            });
            choicesEl.appendChild(examineBtn);
        }
    }

    /**
     * Renders a narrative scene, displaying text and images, and sets up the next button.
     * @param {Object} scene - The scene object to render.
     * @function renderNarrative
     */
    function renderNarrative(scene) {
        const p = document.createElement('p');
        let text = scene.text;
        let playerName = null;
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const user = JSON.parse(raw);
                if (user && user.username) {
                    playerName = user.username;
                }
            }
        } catch (e) {
            playerName = null;
        }
        if (playerName) {
            text = text.replace(/<PLAYER_NAME>/g, playerName);
        }
        p.textContent = text;
        dialogueEl.appendChild(p);

        if (scene.image) {
            const img = document.createElement('img');
            img.src = scene.image;
            img.alt = 'Character';
            characterImageEl.appendChild(img);
        }

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Következő';
        nextBtn.className = 'next-btn';

        if (scene.action === 'redirect' && scene.redirectUrl) {
            nextBtn.addEventListener('click', () => {
                window.location.href = scene.redirectUrl;
            });
        } else if (scene.autoSwitch && scene.location) {
            nextBtn.addEventListener('click', async () => {
                const locationKey = getLocationKeyFromName(scene.location);
                await switchLocation(locationKey, true);
            });
        } else if (scene.nextScene !== undefined) {
            nextBtn.addEventListener('click', () => progressToSceneById(scene.nextScene));
        } else {
            nextBtn.addEventListener('click', progressToNextScene);
        }

        nextButtonContainer.appendChild(nextBtn);
    }

    /**
     * Renders a choices scene, displaying available choices and handling their logic.
     * @param {Object} scene - The scene object to render.
     * @function renderChoices
     */
    function renderChoices(scene) {
                const isCharlotteRoom = currentLocation === 'charlotteszoba';
                const isEvidenceSelection = scene.sceneId === 'evidence_selection';
                const foundStains = gameState.collectedItems.includes('Érdekes foltok');
                const foundBerries = gameState.collectedItems.includes('Bogyók az ágy mellől');
                const foundChest = gameState.gameFlags && gameState.gameFlags.hasNaplo === true;
                const allCharlotteCluesFound = foundStains && foundBerries && foundChest;

                if (isCharlotteRoom && isEvidenceSelection && allCharlotteCluesFound) {
                    const p = document.createElement('p');
                    p.textContent = 'Minden fontos nyomot megtaláltál Charlotte szobájában!';
                    p.style.fontWeight = 'bold';
                    p.style.margin = '16px 0';
                    choicesEl.appendChild(p);

                    const nextBtn = document.createElement('button');
                    nextBtn.textContent = 'Következő';
                    nextBtn.className = 'next-btn';
                    nextBtn.addEventListener('click', () => {
                        progressToSceneById('main_choice');
                    });
                    choicesEl.appendChild(nextBtn);
                    return;
                }
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


        const isPark = currentLocation === 'varosipark';
        const isClueSelection = scene.sceneId === 'clue_selection' || scene.sceneId === 'clue_selection_alone';
        const foundHammer = gameState.collectedItems.includes('Kalapács');
        const foundHandkerchief = gameState.collectedItems.includes('Kendő');
        const foundFruits = gameState.collectedItems.includes('Gyümölcsök');
        const allCluesFound = foundHammer && foundHandkerchief && foundFruits;

        if (isPark && isClueSelection && allCluesFound && !gameState.gameFlags.parkCluesFoundMsgShown) {
            const p = document.createElement('p');
            p.textContent = 'Minden fontos nyomot megtaláltál a parkban!';
            p.style.fontWeight = 'bold';
            p.style.margin = '16px 0';
            choicesEl.appendChild(p);
            gameState.gameFlags.parkCluesFoundMsgShown = true;
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Következő';
            nextBtn.className = 'next-btn';
            nextBtn.addEventListener('click', () => {
                renderCurrentScene();
            });
            choicesEl.appendChild(nextBtn);
            return;
        }

        scene.choices.forEach(choice => {
            if ((choice.id === 'game1' && gameState.gameFlags && gameState.gameFlags.game1Played) ||
                (choice.id === 'game2' && gameState.gameFlags && gameState.gameFlags.game2Played) ||
                (choice.id === 'help_packing' && gameState.gameFlags && gameState.gameFlags.piacGamePlayed)) {
                return;
            }
            if (isPark && isClueSelection) {
                if (choice.label === 'Kalapács' && foundHammer) return;
                if (choice.label === 'Kendő' && foundHandkerchief) return;
                if (choice.label === 'Gyümölcsök' && foundFruits) return;
            }
            if (isCharlotteRoom && isEvidenceSelection && allCharlotteCluesFound) {
                return;
            }
            if (isCharlotteRoom && isEvidenceSelection) {
                if (choice.label === 'Érdekes foltok' && foundStains) return;
                if (choice.label === 'Bogyók az ágynál' && foundBerries) return;
                if (choice.label === 'Láda' && foundChest) return;
            }
            if (isPark && isClueSelection && gameState.gameFlags.parkAnalysisFinished && choice.id !== 'finish') {
                return;
            }
            if (choice.condition && !checkCondition(choice.condition)) {
                return;
            }
            if (choice.requiresItem && !gameState.collectedItems.includes(choice.requiresItem)) {
                return;
            }
            const button = document.createElement('button');
            button.textContent = choice.label;
            button.className = 'choice-bubble';
            button.addEventListener('click', async () => {
                addMinutes(5); 
                if (isPark && isClueSelection && choice.id === 'finish') {
                    await apiClient.setFlags({ parkAnalysisFinished: true });
                    gameState.gameFlags.parkAnalysisFinished = true;
                }
                if (choice.id === 'game1') {
                    await apiClient.setFlags({ game1Played: true });
                    gameState.gameFlags.game1Played = true;
                }
                if (choice.id === 'game2') {
                    await apiClient.setFlags({ game2Played: true });
                    gameState.gameFlags.game2Played = true;
                }
                if (choice.id === 'help_packing') {
                    await apiClient.setFlags({ piacGamePlayed: true });
                    gameState.gameFlags.piacGamePlayed = true;
                }
                handleChoice(choice);
            });
            choicesEl.appendChild(button);
        });

        if (scene.evidencePrompt) {
            const evidenceBtn = document.createElement('button');
            evidenceBtn.textContent = scene.evidencePrompt;
            evidenceBtn.className = 'evidence-prompt-btn';
            evidenceBtn.disabled = true;
            choicesEl.appendChild(evidenceBtn);
        }
    }

    /**
     * Renders an investigation scene, displaying an image and a finish button.
     * @param {Object} scene - The scene object to render.
     * @function renderInvestigation
     */
    function renderInvestigation(scene) {
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

            const minutesToAdd = typeof scene.addMinutes === 'number' ? scene.addMinutes : 5;
            addMinutes(minutesToAdd);
            await apiClient.setFlags({ investigationCompleted: true });
            gameState.gameFlags.investigationCompleted = true;
            progressToSceneById(scene.nextScene);
        });
        choicesEl.appendChild(finishBtn);
    }

    /**
     * Renders an evidence choices scene, displaying available evidence choices.
     * @param {Object} scene - The scene object to render.
     * @function renderEvidenceChoices
     */
    function renderEvidenceChoices(scene) {
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
     * Handles a user choice, updating game state and progressing scenes as needed.
     * @async
     * @param {Object} choice - The choice object selected by the user.
     * @function handleChoice
     */
    async function handleChoice(choice) {
        if (responseActive) return;
        responseActive = true;

        const currentScene = getCurrentScene();
        if (currentScene && currentScene.sceneId === 'home_main_choice' && choice.id === 'rest') {
            const START_TIME_MINUTES = 360; // 6:00
            let investigationTime = typeof gameState.investigationTime === 'number' ? gameState.investigationTime : 0;
            let totalMinutes = investigationTime + START_TIME_MINUTES;
            let daysPassed = Math.floor(totalMinutes / (24 * 60));
            let dayMinutes = totalMinutes % (24 * 60);
            let currentHour = Math.floor(dayMinutes / 60) + 6;
            if (currentHour >= 24) currentHour -= 24;
            let currentMinute = dayMinutes % 60;
            let targetDay = daysPassed;
            if (currentHour > 20 || (currentHour === 20 && currentMinute > 0)) {
                targetDay += 1;
            }
            let newInvestigationTime = (targetDay * 24 * 60) + (20 * 60) - START_TIME_MINUTES;
            if (newInvestigationTime <= investigationTime) {
                targetDay += 1;
                newInvestigationTime = (targetDay * 24 * 60) + (20 * 60) - START_TIME_MINUTES;
            }
            await apiClient.updateGameState({
                time: { hour: 20, minute: 0 },
                investigationTime: newInvestigationTime
            });
            const response = await apiClient.getGameState();
            gameState = response.gameState;
            if (typeof loadTimeFromBackend === 'function') {
                await loadTimeFromBackend();
            }
            await renderCurrentScene();
            responseActive = false;
            return;
        }
        if (currentScene && currentScene.sceneId === 'nyomornegyed_clue_choice') {
            let decision = null;
            if (choice.id === 'accept_offer') {
                decision = 'accepted_help';
            } else if (choice.id === 'thank_but_no') {
                decision = 'declined_help';
            }
            if (decision) {
                await apiClient.setFlags({ nyomornegyed_decision: decision });
                await apiClient.updateGameState({ nyomornegyed_decision: decision });
            }
        }
        if (choice.setState) {
            await apiClient.setFlags(choice.setState);
            await apiClient.updateGameState(choice.setState);
        }
        if (currentScene && currentScene.setState) {
            await apiClient.setFlags(currentScene.setState);
            await apiClient.updateGameState(currentScene.setState);
        }

        if (currentScene && currentScene.sceneId === 'case_solved_question' && choice.label === 'Igen, megoldom az ügyet.') {
            await window.startSolutionFlow();
        } else if (choice.autoSwitch && choice.location) {
            const locationKey = getLocationKeyFromName(choice.location);
            await switchLocation(locationKey, true);
            if (choice.nextScene !== undefined) {
                await progressToSceneById(choice.nextScene);
            }
        } else if (choice.nextScene !== undefined) {
            await progressToSceneById(choice.nextScene);
        }

        responseActive = false;
    }

    /**
     * Progresses to the next scene in the current location.
     * @async
     * @function progressToNextScene
     */
    async function progressToNextScene() {
        const currentScene = getCurrentScene();
        if (!currentScene) {
            console.warn('No current scene to progress from');
            return;
        }
        
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex >= locationScenes.length) {
            console.warn('No more scenes available in this location');
            return;
        }
        
        await progressToSceneById(locationScenes[nextIndex].sceneId);
    }

    /**
     * Finds and progresses to the next valid scene, skipping those with unmet conditions.
     * @async
     * @param {string} currentSceneId - The current scene ID to start searching from.
     * @function findNextValidScene
     */
    async function findNextValidScene(currentSceneId) {
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentSceneId);
        
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            const scene = locationScenes[i];
            
            if (!scene.condition || checkCondition(scene.condition)) {
                await progressToSceneById(scene.sceneId);
                return;
            }
        }
        
        console.warn('No valid scene found with met conditions');
    }

    /**
     * Progresses to a specific scene by its sceneId.
     * @async
     * @param {string} sceneId - The ID of the scene to progress to.
     * @function progressToSceneById
     */
    async function progressToSceneById(sceneId) {
        try {
            const response = await apiClient.progressScene(currentLocation, sceneId);
            gameState = response.gameState;

            await renderCurrentScene();
        } catch (error) {
            console.error('Failed to progress scene:', error);
        }
    }

    /**
     * Switches to a different location, handling confirmation and time logic.
     * @async
     * @param {string} locationKey - The key of the location to switch to.
     * @param {boolean} [skipConfirmation=false] - Whether to skip confirmation dialog.
     * @function switchLocation
     */
    async function switchLocation(locationKey, skipConfirmation = false) {
        try {
            if (!gameState.gameFlags) gameState.gameFlags = {};

            if (!skipConfirmation) {
                clearAreas();
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
                    await renderCurrentScene();
                });
                btnContainer.appendChild(btnYes);
                btnContainer.appendChild(btnNo);
                box.appendChild(btnContainer);

                dialogueEl.appendChild(box);
                return;
            }

            if (locationKey === 'nyomornegyed') {
                const START_TIME_MINUTES = 360; // 6:00
                const totalMinutes = (typeof gameState.investigationTime === 'number' ? gameState.investigationTime : 0) + START_TIME_MINUTES;
                const dayMinutes = totalMinutes % (24 * 60);
                let hour = Math.floor(dayMinutes / 60) + 6;
                if (hour >= 24) hour -= 24;
                const minute = dayMinutes % 60;
                const isNight = (hour >= 20 || hour < 5);
                if (!isNight) {
                    await loadLocation(locationKey);
                    clearAreas();
                    updateBackground('pictures/nyomornegyed.png');
                    const p = document.createElement('p');
                    p.textContent = 'Túl korán van ahhoz hogy erre a helyszínre jöhess.';
                    dialogueEl.appendChild(p);
                    return;
                }
            }

            addMinutes(40); 
            await loadLocation(locationKey);

            const startingSceneResponse = await apiClient.getStartingScene(locationKey);
            const startingSceneId = startingSceneResponse.startingSceneId;

            const response = await apiClient.updateGameState({
                currentLocation: locationKey,
            });
            gameState = response.gameState;

            await apiClient.progressScene(locationKey, startingSceneId);
            gameState.currentSceneIds[locationKey] = startingSceneId;

            setupLocationButtons();

            await renderCurrentScene();
        } catch (error) {
            console.error(`Failed to switch to location ${locationKey}:`, error);
        }
    }

    /**
     * Gets the location key from a display name.
     * @param {string} displayName - The display name of the location.
     * @returns {string} The location key.
     * @function getLocationKeyFromName
     */
    function getLocationKeyFromName(displayName) {
        if (!locationsMetadata) return displayName;
        
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
     * Checks a game condition for scene progression or choice availability.
     * @param {string} condition - The condition to check.
     * @returns {boolean} True if the condition is met, false otherwise.
     * @function checkCondition
     */
    function checkCondition(condition) {
                                if (condition === 'piacLookedAround') {
                                    return gameState.gameFlags && gameState.gameFlags.piacLookedAround === true;
                                }
                                if (condition === 'NOT_piacLookedAround') {
                                    return !(gameState.gameFlags && gameState.gameFlags.piacLookedAround === true);
                                }
                        if (condition === 'allCharlotteCluesFound') {
                            if (!gameState || !gameState.collectedItems) return false;
                            return (
                                gameState.collectedItems.includes('Érdekes foltok') &&
                                gameState.collectedItems.includes('Bogyók az ágy mellől') &&
                                gameState.gameFlags && gameState.gameFlags.hasNaplo === true
                            );
                        }
                        if (condition === 'NOT_allCharlotteCluesFound') {
                            if (!gameState || !gameState.collectedItems) return true;
                            return !(
                                gameState.collectedItems.includes('Érdekes foltok') &&
                                gameState.collectedItems.includes('Bogyók az ágy mellől') &&
                                gameState.gameFlags && gameState.gameFlags.hasNaplo === true
                            );
                        }
                if (condition === 'allCluesFound') {
                    if (!gameState || !gameState.collectedItems) return false;
                    return (
                        gameState.collectedItems.includes('Kalapács') &&
                        gameState.collectedItems.includes('Kendő') &&
                        gameState.collectedItems.includes('Gyümölcsök')
                    );
                }
                if (condition === 'NOT_allCluesFound') {
                    if (!gameState || !gameState.collectedItems) return true;
                    return !(
                        gameState.collectedItems.includes('Kalapács') &&
                        gameState.collectedItems.includes('Kendő') &&
                        gameState.collectedItems.includes('Gyümölcsök')
                    );
                }
                if (condition && condition.includes('_AND_')) {
                    const parts = condition.split('_AND_');
                    return parts.every(part => checkCondition(part));
                }
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
            return (gameState.gameFlags.ghostskinInfoNeeded === true) || (gameState.ghostskinInfoNeeded === true);
        }

        return (gameState.gameFlags[condition] === true) || (gameState[condition] === true);
    }

    /**
     * Updates the items list display in the UI.
     * @function updateItemsList
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
     * Handles item click when evidence prompt is active, progressing to the appropriate scene.
     * @param {string} itemName - The name of the clicked item.
     * @function handleItemClick
     */
    function handleItemClick(itemName) {
        const currentScene = getCurrentScene();
        
        console.log('Item clicked:', itemName);
        console.log('Current scene ID:', currentScene?.sceneId);
        
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            if (locationScenes[i].type === 'evidence_choices') {
                addMinutes(5); 
                const evidenceScene = locationScenes[i];
                console.log('Evidence choices:', evidenceScene.choices);
                
                const matchingChoice = evidenceScene.choices.find(choice => {
                    console.log('Checking choice:', choice.label, 'requiresItem:', choice.requiresItem);
                    return choice.requiresItem && choice.requiresItem === itemName;
                });
                
                console.log('Matching choice found:', matchingChoice);
                
                if (matchingChoice && matchingChoice.nextScene !== undefined) {
                    console.log('Jumping to scene:', matchingChoice.nextScene);
                    progressToSceneById(matchingChoice.nextScene);
                    return;
                }
                
                console.log('No matching choice for this item - ignoring click');
                return;
            }
        }
        
        console.warn('No evidence_choices scene found after current scene');
    }

    /**
     * Shows the next evidence choices scene after the current scene.
     * @function showEvidenceChoices
     */
    function showEvidenceChoices() {
        const currentScene = getCurrentScene();
        const currentIndex = locationScenes.findIndex(s => s.sceneId === currentScene.sceneId);
        
        for (let i = currentIndex + 1; i < locationScenes.length; i++) {
            if (locationScenes[i].type === 'evidence_choices') {
                progressToSceneById(locationScenes[i].sceneId);
                return;
            }
        }
    }

    /**
     * Sets up the location buttons in the UI for discovered locations.
     * @function setupLocationButtons
     */
    function setupLocationButtons() {
        if (!locationsListEl) return;

        locationsListEl.innerHTML = '';

        gameState.discoveredLocations.forEach(locationKey => {
            const metadata = locationsMetadata[locationKey];
            if (!metadata) return;

            const li = document.createElement('li');
            li.textContent = metadata.displayName;
            li.className = 'location-item';
            
            if (locationKey === currentLocation) {
                li.classList.add('active');
            }
            
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => switchLocation(locationKey));
            locationsListEl.appendChild(li);
        });
    }

    /**
     * Clears the display areas for dialogue, choices, character image, and next button.
     * @function clearAreas
     */
    function clearAreas() {
        if (dialogueEl) {
            const children = Array.from(dialogueEl.children);
            children.forEach(child => {
                if (child.id !== 'choices') {
                    child.remove();
                }
            });
        }
        const choicesElement = document.getElementById('choices');
        if (choicesElement) choicesElement.innerHTML = '';
        
        if (characterImageEl) characterImageEl.innerHTML = '';
        if (nextButtonContainer) nextButtonContainer.innerHTML = '';
    }

    initializeGame();
    if (typeof loadTimeFromBackend === 'function') {
        await loadTimeFromBackend();
    }

    window.gameEngine = {
        getGameState: () => gameState,
        refreshState: initializeGame,
        apiClient: apiClient,
    };
})();

