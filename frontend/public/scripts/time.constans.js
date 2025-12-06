export const START_TIME_MINUTES = 360; // 6:00
let currentTime = START_TIME_MINUTES;

export async function loadTimeFromBackend() {
  if (window.apiClient && window.apiClient.getGameState) {
    try {
      const response = await window.apiClient.getGameState();
      if (response && response.gameState && typeof response.gameState.investigationTime === 'number') {
        currentTime = START_TIME_MINUTES + response.gameState.investigationTime;
        console.log('[DEBUG] loadTimeFromBackend: investigationTime from backend:', response.gameState.investigationTime, '-> currentTime:', currentTime);
        updateTimeDisplay();
      } else {
        console.warn('[DEBUG] loadTimeFromBackend: No valid investigationTime in backend response', response);
      }
    } catch (e) {
      console.error('Failed to load time from backend:', e);
    }
  }
}

export function addMinutes(minutes) {
  currentTime += minutes;
  updateTimeDisplay();
  saveTimeToBackend();
}

export function getCurrentTimeString() {
  const minutesSinceStart = currentTime - START_TIME_MINUTES;
  const totalMinutes = minutesSinceStart >= 0 ? minutesSinceStart : 0;
  const day = Math.floor(totalMinutes / (24 * 60)) + 1;
  const dayMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(dayMinutes / 60) + 6; // Start at 6:00
  const displayHours = hours >= 24 ? hours - 24 : hours;
  const minutes = dayMinutes % 60;
  // If hours >= 24, increment day
  const realDay = hours >= 24 ? day + 1 : day;
  const realHours = hours >= 24 ? displayHours : hours;
  return `${realDay}. nap ${realHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
  const el = document.getElementById('gameTime');
  const timeStr = getCurrentTimeString();
  if (el) {
    el.textContent = timeStr;
    console.log('[DEBUG] updateTimeDisplay: gameTime element updated to', timeStr);
  } else {
    console.warn('[DEBUG] updateTimeDisplay: gameTime element not found');
  }
}

function saveTimeToBackend() {
  if (window.apiClient) {
    window.apiClient.updateGameState({ investigationTime: currentTime - START_TIME_MINUTES });
  }
}

export function resetTime() {
  currentTime = START_TIME_MINUTES;
  updateTimeDisplay();
  saveTimeToBackend();
}

export function setTime(minutes) {
  currentTime = minutes;
  updateTimeDisplay();
  saveTimeToBackend();
}
