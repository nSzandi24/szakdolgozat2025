

(function(){
    // Location-based scenes: each location has its own scenes
    // Import scenes from separate location files
    const locationScenes = {
        'Otthon': otthonScenes,
        'Városi park': varosiparkScenes,
        'Báró birtoka': barobirtokaScenes,
        'Piac': piacScenes,
        'Rendőrség': rendorsegScenes
    };

    let currentLocation = 'Otthon';
    let locationIndices = {}; // track scene index for each location
    let seenOnceScenes = new Set(); // track scenes marked as 'once' that have been seen
    let responseActive = false;
    let discoveredLocations = new Set(['Otthon']);
    let investigationCompleted = false; // track if investigation has been done
    let lucasDialogueCompleted = false; // track if Lucas dialogue has been completed
    let lucasAvailable = true; // track if Lucas is available to talk
    
    // Map location names to background images
    const locationBackgrounds = {
        'Otthon': otthonBackground,
        'Városi park': varosiparkBackground,
        'Báró birtoka': barobirtokaBackground,
        'Piac': piacBackground,
        'Rendőrség': rendorsegBackground
    };
    
    // Get user-specific storage key
    function getStorageKey(){
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            return `game_progress_${user.username}`;
        } catch(e) {
            console.warn('Failed to get user info:', e);
            return null;
        }
    }

    const dialogueEl = document.getElementById('dialogue');
    const choicesEl = document.getElementById('choices');
    const characterImageEl = document.getElementById('characterImage');
    const controlsEl = document.querySelector('.controls');
    const nextButtonContainer = document.getElementById('nextButtonContainer');

    function clearAreas(){
        if (dialogueEl) dialogueEl.innerHTML = '';
        if (choicesEl) choicesEl.innerHTML = '';
        if (characterImageEl) characterImageEl.innerHTML = '';
        if (nextButtonContainer) nextButtonContainer.innerHTML = '';
    }

    function changeBackground(locationName){
        const bgImage = locationBackgrounds[locationName];
        if (bgImage) {
            document.body.style.backgroundImage = `url('${bgImage}')`;
            currentLocation = locationName;
            
            if (locationName === 'Otthon') {
                // For Otthon: if returning, skip to first non-once scene
                if (!(locationName in locationIndices)) {
                    locationIndices[locationName] = 0;
                } else {
                    const scenes = locationScenes[locationName] || [];
                    let startIdx = 0;
                    for (let i = 0; i < scenes.length; i++) {
                        const sceneKey = `${locationName}_${i}`;
                        if (!scenes[i].once || !seenOnceScenes.has(sceneKey)) {
                            startIdx = i;
                            break;
                        }
                    }
                    locationIndices[locationName] = startIdx;
                }
            } else if (locationName === 'Városi park' && lucasDialogueCompleted) {
                // For Városi park: if Lucas dialogue completed, determine start scene based on lucasAvailable
                const scenes = locationScenes[locationName] || [];
                
                if (!lucasAvailable) {
                    // If Lucas left, start at scene 28 (new intro text)
                    locationIndices[locationName] = 28;
                } else {
                    // Otherwise skip to "Mit teszel?" scene
                    let startIdx = 0;
                    for (let i = 0; i < scenes.length; i++) {
                        const sceneKey = `${locationName}_${i}`;
                        if (!scenes[i].once || !seenOnceScenes.has(sceneKey)) {
                            startIdx = i;
                            break;
                        }
                    }
                    // If all once scenes are seen, go to scene 6 ("Mit teszel?")
                    if (startIdx >= 6 || (scenes[startIdx] && !scenes[startIdx].once)) {
                        locationIndices[locationName] = 6;
                    } else {
                        locationIndices[locationName] = startIdx;
                    }
                }
            } else {
                // For all other locations: always start from beginning
                locationIndices[locationName] = 0;
            }
            
            updateLocations(); // Update the location list to show active state
            renderScene();
            saveProgress();
        }
    }

    function updateLocations(){
        const locationsList = document.querySelector('.locations-section ul');
        if (!locationsList) return;
        locationsList.innerHTML = '';
        discoveredLocations.forEach(loc => {
            const li = document.createElement('li');
            li.className = 'location-item';
            // Add 'active' class if this is the current location
            if (loc === currentLocation) {
                li.classList.add('active');
            }
            li.textContent = loc;
            // Add click handler to change background only if not already at this location
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                if (currentLocation !== loc) {
                    changeBackground(loc);
                }
            });
            locationsList.appendChild(li);
        });
    }

    function saveProgress(){
        try {
            const key = getStorageKey();
            if (!key) return;
            const state = { 
                currentLocation,
                locationIndices, 
                responseActive, 
                discoveredLocations: Array.from(discoveredLocations),
                seenOnceScenes: Array.from(seenOnceScenes),
                investigationCompleted,
                lucasDialogueCompleted,
                lucasAvailable
            };
            localStorage.setItem(key, JSON.stringify(state));
        } catch(e) {
            console.warn('Failed to save progress:', e);
        }
    }

    function loadProgress(){
        try {
            const key = getStorageKey();
            if (!key) return null;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch(e) {
            console.warn('Failed to load progress:', e);
            return null;
        }
    }

    function renderScene(){
        clearAreas();
        responseActive = false;
        
        const scenes = locationScenes[currentLocation] || [];
        const idx = locationIndices[currentLocation] || 0;
        
        // Check if current scene is a 'once' scene that was already seen
        const currentScene = scenes[idx];
        const isSeenOnceScene = currentScene && currentScene.once && seenOnceScenes.has(`${currentLocation}_${idx}`);
        
        if(idx < 0) {
            locationIndices[currentLocation] = 0;
            return;
        }
        if(idx >= scenes.length){
            return;
        }
        const s = scenes[idx];
        
        // Skip scene if it has a condition that's not met
        if (s.condition === 'lucasAvailable' && !lucasAvailable) {
            // Move to next scene
            locationIndices[currentLocation] = (locationIndices[currentLocation] || 0) + 1;
            renderScene();
            saveProgress();
            return;
        }
        
        // Mark this scene as seen if it's marked 'once'
        if (s.once) {
            const sceneKey = `${currentLocation}_${idx}`;
            seenOnceScenes.add(sceneKey);
        }
        
        // check if this scene unlocks a new location
        if (s.location && !discoveredLocations.has(s.location)) {
            discoveredLocations.add(s.location);
            updateLocations();
        }
        
        if(s.type === 'narrative'){
            const b = document.createElement('div');
            b.className = 'bubble';
            b.textContent = s.text;
            dialogueEl.appendChild(b);
            
            // if the scene has an image, render it in separate character section
            // But skip Lucas image if he's not available
            if (s.image && characterImageEl) {
                const isLucasImage = s.image.includes('lucas.png');
                if (!isLucasImage || (isLucasImage && lucasAvailable)) {
                    const img = document.createElement('img');
                    img.src = s.image;
                    img.alt = '';
                    img.className = 'narrative-img';
                    characterImageEl.appendChild(img);
                }
            }
            
            // Add Next button for narrative scenes
            // Exclude: Otthon scene 4 ("Részleteket sajnos nem tudok...")
            // Exclude: Otthon scene 5 (last fallback scene)
            const isOtthonExcluded = currentLocation === 'Otthon' && (idx === 4 || idx === 5);
            const shouldShowNextButton = !isOtthonExcluded;
            
            if (shouldShowNextButton && nextButtonContainer) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'next-btn';
                nextBtn.type = 'button';
                nextBtn.textContent = 'Következő';
                nextBtn.addEventListener('click', () => {
                    // Check if scene has a redirect action
                    if (s.action === 'redirect' && s.redirectUrl) {
                        window.location.href = s.redirectUrl;
                        return;
                    }
                    
                    // Check if narrative has a nextScene property
                    if (s.nextScene !== undefined) {
                        locationIndices[currentLocation] = s.nextScene;
                    } else {
                        // Otherwise increment normally
                        locationIndices[currentLocation] = (locationIndices[currentLocation] || 0) + 1;
                    }
                    renderScene();
                    saveProgress();
                });
                nextButtonContainer.appendChild(nextBtn);
            }
        } else if(s.type === 'choices'){
            // if the scene has an image, render it in separate character section
            // But skip Lucas image if he's not available
            if (s.image && characterImageEl) {
                const isLucasImage = s.image.includes('lucas.png');
                if (!isLucasImage || (isLucasImage && lucasAvailable)) {
                    const img = document.createElement('img');
                    img.src = s.image;
                    img.alt = '';
                    img.className = 'narrative-img';
                    characterImageEl.appendChild(img);
                }
            }
            
            const prompt = document.createElement('div');
            prompt.className = 'bubble';
            prompt.textContent = s.prompt || '';
            dialogueEl.appendChild(prompt);

            // Create a grid container for choices if there are many items
            const hasMultipleChoices = s.choices.filter(choice => {
                if (choice.condition === 'investigationCompleted' && !investigationCompleted) {
                    return false;
                }
                return true;
            }).length > 6;

            let choicesContainer;
            if (hasMultipleChoices) {
                choicesContainer = document.createElement('div');
                choicesContainer.className = 'choices-grid';
                choicesContainer.style.display = 'grid';
                choicesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
                choicesContainer.style.gap = '10px';
                choicesContainer.style.marginTop = '20px';
                dialogueEl.appendChild(choicesContainer);
            }

            s.choices.forEach(choice => {
                // Check if choice has a condition and if it's met
                if (choice.condition === 'investigationCompleted' && !investigationCompleted) {
                    return; // Skip this choice if investigation not completed
                }
                if (choice.condition === 'lucasAvailable' && !lucasAvailable) {
                    return; // Skip Lucas option if he's not available
                }
                
                const cb = document.createElement('button');
                cb.className = 'choice-bubble';
                cb.type = 'button';
                cb.textContent = choice.label;
                
                // Special styling for "finish" choice (Nyomok keresésének befejezése)
                if (choice.id === 'finish') {
                    cb.style.background = '#E0D1A2';
                    cb.style.color = '#000';
                    cb.style.border = '2px solid #000';
                    cb.style.borderRadius = '16px';
                    cb.style.fontStyle = 'italic';
                    cb.style.padding = '10px 14px';
                    cb.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
                }
                
                cb.addEventListener('click', () => {
                    console.debug('[start.js] choice clicked', choice.id);
                    
                    // Mark Lucas dialogue as completed when clicking Lucas option
                    if (choice.id === 'lucas' || choice.id === 'lucas2') {
                        lucasDialogueCompleted = true;
                    }
                    
                    if (choice.nextScene !== undefined) {
                        // Jump to specific scene
                        locationIndices[currentLocation] = choice.nextScene;
                        renderScene();
                        
                        // Mark Lucas as unavailable AFTER rendering the goodbye scene
                        if (choice.id === 'finish') {
                            lucasAvailable = false;
                        }
                        
                        saveProgress();
                    } else if (choice.response) {
                        // Show inline response (old behavior)
                        showInlineResponse(choice.response, choice.image);
                    }
                });
                
                // Append to grid container if exists, otherwise to dialogue
                if (hasMultipleChoices && choicesContainer) {
                    choicesContainer.appendChild(cb);
                } else {
                    dialogueEl.appendChild(cb);
                }
            });
        } else if(s.type === 'investigation'){
            // Hide controls and dialogue for investigation
            if (controlsEl) controlsEl.style.display = 'none';
            if (dialogueEl) dialogueEl.style.display = 'none';
            
            // Investigation scene: show image in a container with button below
            const container = document.createElement('div');
            container.className = 'investigation-container';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.gap = '20px';
            container.style.padding = '40px';
            container.style.background = 'white';
            container.style.borderRadius = '12px';
            container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            container.style.maxWidth = '900px';
            container.style.margin = '0 auto';
            
            if (s.image) {
                const img = document.createElement('img');
                img.src = s.image;
                img.alt = '';
                img.className = 'investigation-img';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '8px';
                container.appendChild(img);
            }
            
            // Create the finish button
            const finishBtn = document.createElement('button');
            finishBtn.className = 'choice-bubble finish-investigation-btn';
            finishBtn.type = 'button';
            finishBtn.textContent = s.buttonLabel || 'Befejezés';
            finishBtn.style.minWidth = '250px';
            finishBtn.style.background = '#E0D1A2';
            finishBtn.style.color = '#000';
            finishBtn.style.border = '2px solid #000';
            finishBtn.style.borderRadius = '16px';
            finishBtn.style.fontStyle = 'italic';
            finishBtn.addEventListener('click', () => {
                // Mark investigation as completed
                investigationCompleted = true;
                
                // Restore controls and dialogue
                if (controlsEl) controlsEl.style.display = '';
                if (dialogueEl) dialogueEl.style.display = '';
                
                if (s.nextScene !== undefined) {
                    locationIndices[currentLocation] = s.nextScene;
                    renderScene();
                    saveProgress();
                }
            });
            container.appendChild(finishBtn);
            
            // Append to characterImage section instead of dialogue
            if (characterImageEl) {
                characterImageEl.appendChild(container);
            }
        } else {
            // For non-investigation scenes, ensure controls and dialogue are visible
            if (controlsEl) controlsEl.style.display = '';
            if (dialogueEl) dialogueEl.style.display = '';
        }
        saveProgress();
    }

    function showInlineResponse(text, imageUrl){
        // clear previous dialogue and choices
        if (dialogueEl) dialogueEl.innerHTML = '';
        if (choicesEl) choicesEl.innerHTML = '';
        if (characterImageEl) characterImageEl.innerHTML = '';

        // If there's an image, show it
        if (imageUrl && characterImageEl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = '';
            img.className = 'narrative-img';
            characterImageEl.appendChild(img);
        }

        // response container
        const wrap = document.createElement('div');
        wrap.className = 'response-inline-wrap';

        const resp = document.createElement('div');
        resp.className = 'bubble response-inline';
        resp.textContent = text;
        wrap.appendChild(resp);

        // mark that a response is active; Next button will restore choices
        responseActive = true;
        saveProgress();

        if (dialogueEl) dialogueEl.appendChild(wrap);
    }

    // Init - load saved progress if exists
    const saved = loadProgress();
    if (saved) {
        currentLocation = saved.currentLocation || 'Otthon';
        locationIndices = saved.locationIndices || {};
        responseActive = saved.responseActive || false;
        investigationCompleted = saved.investigationCompleted || false;
        lucasDialogueCompleted = saved.lucasDialogueCompleted || false;
        lucasAvailable = saved.lucasAvailable !== undefined ? saved.lucasAvailable : true;
        if (saved.discoveredLocations) {
            discoveredLocations = new Set(saved.discoveredLocations);
        }
        if (saved.seenOnceScenes) {
            seenOnceScenes = new Set(saved.seenOnceScenes);
        }
    }
    
    // Initialize current location index if not exists
    if (!(currentLocation in locationIndices)) {
        locationIndices[currentLocation] = 0;
    }
    
    // Set initial background
    const bgImage = locationBackgrounds[currentLocation];
    if (bgImage) {
        document.body.style.backgroundImage = `url('${bgImage}')`;
    }
    updateLocations();
    renderScene();

})();
