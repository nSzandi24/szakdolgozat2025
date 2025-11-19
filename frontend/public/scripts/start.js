

(function(){
    const scenes = [
        {type:'narrative', text:'Kalandod egy középkori városban kezdődik Szirtkikötőben. E kisváros jelentős helyszín az ország számára mert egy fontos kikötőváros, ahol rengeteg kereskedelem zajlik. Egy fejlett város, így mindenféle emberrel találkozhatsz. Itt élsz te is mint egy visszavonult városi őr. Legutolsó ügyedben olyan személyeket kerestél meg és kérdeztél ki, akiket talán nem kellett volna, így úgy döntöttél inkább visszavonulsz és alkalomadtán egy-egy ügyet egyedül kinyomozól. De az itteni lakosok ismernek a városban, tisztelték a munkádat így az emberek többsége barátságosan és segítően fogad. A mai napod is átlagosan kezdődik, otthon vagy még mikor a városi őr dübörög az ajtódon és a nevedet kiáltozza segítségért..'},
        {type:'narrative', text:'Alex detektív! Kérem nyissa ki az ajtót, sürgős ügyben keresem!'},
        {type:'narrative', text:'Ahogy kinyitod az ajtót, Gerald-val találod szembe magadat, az egyik városi őrrel. Eléggé liheg és arcáról rémületet tudsz leolvasni'},
        {type:'narrative', image: 'pictures/characters/gerald.png',text:'Alex detektív! Kérem azonnal jöjjön velem, találtunk egy holtestet a parkban, szükségünk lenne az Ön segítségére!' },

        /*{type:'choices', prompt:'Mit szeretnél megnézni először?', choices:[
            {id:'c1', label:'A levélszekrény', response:'A levélben egy titokzatos utalás található: "Találkozó éjfélkor".'},
            {id:'c2', label:'A padló nyomai', response:'A padlón apró gumiabroncs-nyomok vezetnek a piac irányába.'},
            {id:'c3', label:'A közelben álló alak', response:'Az alak eltűnik, amikor közelebb érsz, de egy csillogó fémdarab hever a földön.'}
        ]},*/
        //{type:'narrative', text:'Ahogy közelebb lépsz, furcsa zaj hallatszik a sikátor felől.'}
    ];

    let idx = 0;
    let responseActive = false; // true when a choice response is currently shown inline
    let history = [];
    // Persisted key for current progress
    const STORAGE_KEY = 'game_state_v1';

    const dialogueEl = document.getElementById('dialogue');
    const choicesEl = document.getElementById('choices');
    // We'll render responses inline (replace dialogue+choices area)
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');

    function clearAreas(){
        if (dialogueEl) dialogueEl.innerHTML = '';
        if (choicesEl) choicesEl.innerHTML = '';
    }

    function saveState(){
        try{
            const state = { idx, responseActive, responseText: (responseActive? (document.querySelector('.response-inline')?.textContent || '') : '') };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }catch(e){ console.warn('saveState failed', e); }
    }

    function loadState(){
        try{
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        }catch(e){ console.warn('loadState failed', e); return null; }
    }

    function renderScene(){
        clearAreas();
        responseActive = false;
        // enable/disable back button depending on history or active response
        try { if (backBtn) backBtn.disabled = !(responseActive || history.length>0); } catch(e){}
        if(idx < 0) idx = 0;
        if(idx >= scenes.length){
            dialogueEl.innerHTML = '<div class="bubble">A jelenet véget ért. Gratulálok!</div>';
            nextBtn.disabled = true;
            return;
        }
        nextBtn.disabled = false;
        const s = scenes[idx];
        if(s.type === 'narrative'){
            const b = document.createElement('div');
            b.className = 'bubble';
            b.textContent = s.text;
            dialogueEl.appendChild(b);
            // if the scene has an image, render it below the narrative bubble
            if (s.image) {
                const img = document.createElement('img');
                img.src = s.image;
                img.alt = '';
                img.className = 'narrative-img';
                dialogueEl.appendChild(img);
            }
        } else if(s.type === 'choices'){
            const prompt = document.createElement('div');
            prompt.className = 'bubble';
            prompt.textContent = s.prompt || '';
            dialogueEl.appendChild(prompt);

            s.choices.forEach(choice => {
                const cb = document.createElement('button');
                cb.className = 'choice-bubble';
                cb.type = 'button';
                cb.textContent = choice.label;
                cb.addEventListener('click', () => {
                    console.debug('[start.js] choice clicked', choice.id);
                    showInlineResponse(choice.response);
                });
                choicesEl.appendChild(cb);
            });
        }
        // persist current index/scene state
        saveState();
    }

    function showInlineResponse(text){
        // clear previous dialogue and choices
        if (dialogueEl) dialogueEl.innerHTML = '';
        if (choicesEl) choicesEl.innerHTML = '';

        // response container
        const wrap = document.createElement('div');
        wrap.className = 'response-inline-wrap';

        const resp = document.createElement('div');
        resp.className = 'bubble response-inline';
        resp.textContent = text;
        wrap.appendChild(resp);

        // mark that a response is active; Next button will restore choices
        responseActive = true;
        // persist response text so reloads can restore it
        try{ saveState(); } catch(e){}
        try { if (backBtn) backBtn.disabled = false; } catch(e){}
        // optionally focus the Next button so user can press it
        try { if (nextBtn) nextBtn.focus(); } catch (e){}

        if (dialogueEl) dialogueEl.appendChild(wrap);
    }

    nextBtn.addEventListener('click', () => {
        if (responseActive) {
            // restore the choices for the same scene
            responseActive = false;
            renderScene();
            return;
        }
        // push current scene to history before moving forward
        history.push(idx);
        idx++;
        renderScene();
        saveState();
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // if a response is active, first restore choices for this scene
            if (responseActive) {
                responseActive = false;
                renderScene();
                return;
            }
            if (history.length > 0) {
                idx = history.pop();
                renderScene();
                saveState();
            }
        });
    }

    // Init: try to restore previous state
    const prev = loadState();
    if (prev && typeof prev.idx === 'number'){
        idx = prev.idx;
    }
    renderScene();
    // if previous state had an active response, restore it
    if (prev && prev.responseActive && prev.responseText){
        showInlineResponse(prev.responseText);
    }

})();
