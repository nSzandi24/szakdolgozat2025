document.addEventListener('DOMContentLoaded', async function() {
  const endingText = document.getElementById('endingText');
  const logoutBtn = document.getElementById('logoutBtn');
  // Add Tovább button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Tovább';
  nextBtn.style.display = 'none';
  nextBtn.style.marginTop = '24px';
  nextBtn.style.fontSize = '18px';
  nextBtn.style.borderRadius = '24px';
  nextBtn.style.padding = '10px 32px';
  nextBtn.className = 'next-btn';
  endingText.parentNode.appendChild(nextBtn);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await window.apiClient.logout();
      } catch (e) {}
      window.location.href = 'login.html';
    });
  }

  function showPaginatedText(paragraphs) {
    let idx = 0;
    function showCurrent() {
      endingText.textContent = paragraphs[idx];
      if (idx < paragraphs.length - 1) {
        nextBtn.style.display = '';
      } else {
        nextBtn.style.display = 'none';
      }
    }
    nextBtn.onclick = function() {
      if (idx < paragraphs.length - 1) {
        idx++;
        showCurrent();
      }
    };
    showCurrent();
  }

  try {
    const response = await window.apiClient.getGameState();
    const nyomornegyedDecision = response.gameState?.nyomornegyed_decision;
    if (nyomornegyedDecision === 'accepted_help') {
      showPaginatedText([
        "Charlotte cseléd élte a szokványos életét a báró birtokán, végezte a cseléd feladatait, vigyázott a kis Sebastian gyermekre.",
        "A bonyodalom ott kezdődött el, mikor viszonyt kezdett a lovászfiúval Thomas-val. Ennek a viszonynak az eredménye az lett, hogy Charlotte teherbe esett. Nem merte elmondani senkinek, de sajnos kihatott a munkájára, egyre nehezebben tudta teljesíteni a feladatait. Valamilyen megoldást kellett találnia.",
        "Hallott a Ghostskin nevű emberről és hogy olyan gyógyszereket árul, amit gyógynövény árusoknál nem lehet kapni. Ezért elment a nyomornegyedbe és vett gyógyszert ami csillapítani tudta a fájdalmait. De sajnos fizetni nem tudott.",
        "Egyik alkalommal mikor hazafele tartott a piacról megkereste a Ghostskin és megfenyegette, hogy fizessen vagy nagy bajok lesznek. Ez alkalommal is vele tartott Sebastian a báró fia, akire a Ghostskin felfigyelt és adott neki cukorkát.",
        "Mivel a tartozást Charlotte nem rendezte ezért a gyilkosság napján a Ghostskin kiadta az utasítást 3 nyomornegyedi gyermeknek, hogy hozzák el a kisfiút míg ő elíntézi a cselédet.",
        "A nyomozásod során többször is összeakadtál te is a Ghostskin-vel. A nyomornegyedben is veled tartott, így amikor a 3 fiút kérdezted ki, nem merték elmondani az igazat a Ghostskin miatt.",
        "Ez idő alatt a Ghostkin-nek sikerült más szállítókkal elrejteni a nyomornegyedben a kis Sebastian-t, így sajnos a városi őrség sem találta meg.",
        "Végül a Ghostskin eladta a kisfiút egy titokzatos vevőnek, aki egy távoli városba vitte magával. Emellett a Ghostskinnek is sikerült eltűnnie a nyomornegyedből, így soha többé nem hallottál felőle."
      ]);
    } else  {
      showPaginatedText([
        "Charlotte cseléd élte a szokványos életét a báró birtokán, végezte a cseléd feladatait, vigyázott a kis Sebastian gyermekre.",
        "A bonyodalom ott kezdődött el, mikor viszonyt kezdett a lovászfiúval Thomas-val. Ennek a viszonynak az eredménye az lett, hogy Charlotte teherbe esett. Nem merte elmondani senkinek, de sajnos kihatott a munkájára, egyre nehezebben tudta teljesíteni a feladatait. Valamilyen megoldást kellett találnia.",
        "Hallott a Ghostskin nevű emberről és hogy olyan gyógyszereket árul, amit gyógynövény árusoknál nem lehet kapni. Ezért elment a nyomornegyedbe és vett gyógyszert ami csillapítani tudta a fájdalmait. De sajnos fizetni nem tudott.",
        "Egyik alkalommal mikor hazafele tartott a piacról megkereste a Ghostskin és megfenyegette, hogy fizessen vagy nagy bajok lesznek. Ez alkalommal is vele tartott Sebastian a báró fia, akire a Ghostskin felfigyelt és adott neki cukorkát.",
        "Mivel a tartozást Charlotte nem rendezte ezért a gyilkosság napján a Ghostskin kiadta az utasítást 3 nyomornegyedi gyermeknek, hogy hozzák el a kisfiút míg ő elíntézi a cselédet.",
        "A nyomozásod során többször is összeakadtál te is a Ghostskin-vel. A nyomornegyedben nem tartott veled, így amikor a 3 fiút kérdezted ki, elmondták az igazat az elrablásról és beavattak néhány részletbe, hogy mi folyik a nyomornegyedben.",
        "A nyomornegyedben talált nyomok alapján sikerült a városi őrségnek megtalálni a kis Sebastian-t, aki épségben visszakerült a báróhoz.",
        "A Ghostskin-t pedig a városi őrség elfogta a nyomornegyedben, és bíróság elé állították rengeteg bűncselekmény miatt. Végül hosszú börtönbüntetésre ítélték."
      ]);
    }
  } catch (e) {
    endingText.textContent = "Nem sikerült lekérni a játékállapotot. Hiba: " + (e && e.message ? e.message : e);
    console.error('storyEnding.js error:', e);
  }
});
