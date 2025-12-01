document.addEventListener('DOMContentLoaded', async function() {
  const endingText = document.getElementById('endingText');
  try {
    const response = await window.apiClient.getGameState();
    const nyomornegyedDecision = response.gameState?.nyomornegyed_decision;
    if (nyomornegyedDecision === 'accepted_help') {
      endingText.textContent = "Elfogadtad a segítséget, így a történet boldogabb véget ért...";
    } else  {
      endingText.textContent = "Elutasítottad a segítséget, ezért a történet más irányt vett...";
    }
  } catch (e) {
    endingText.textContent = "Nem sikerült lekérni a játékállapotot. Hiba: " + (e && e.message ? e.message : e);
    console.error('storyEnding.js error:', e);
  }
});
