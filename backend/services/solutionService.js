const { Solution, Point } = require('../database');

const CORRECT_ANSWERS = {
  weapon: 'Kalapács',
  killer: 'Névtelen alak',
  motive: 'Bogyók',
  kidnapper: 'A 3 kisfiú',
  kidnapMotive: 'Foltok',
  ghostskin: 'Névtelen alak',
};

/**
 * Save the user's solution answers and calculate points.
 * Awards points for each correct answer and for completed games.
 * @param {number|string} userId - The user ID.
 * @param {Object} answers - The user's answers.
 * @returns {Promise<number>} The total points awarded.
 */
async function saveSolution(userId, answers) {
  await Solution.create({
    userId,
    weapon: answers.weapon,
    killer: answers.killer,
    motive: answers.motive,
    kidnapper: answers.kidnapper,
    kidnapMotive: answers.kidnapMotive,
    ghostskin: answers.ghostskin,
  });

  let points = 0;
  for (const key of Object.keys(CORRECT_ANSWERS)) {
    if ((answers[key] || '').trim() === CORRECT_ANSWERS[key]) {
      points += 15;
    }
  }

  const { GameSave } = require('../database');
  const gameSave = await GameSave.getOrCreateForUser(userId);
  if (gameSave.game1_completed) points += 20;
  if (gameSave.game2_completed) points += 20;

  await Point.upsert({ userId, points });
  return points;
}

/**
 * Get the user's total points.
 * @param {number|string} userId - The user ID.
 * @returns {Promise<number>} The user's points.
 */
async function getUserPoints(userId) {
  const point = await Point.findOne({ where: { userId } });
  return point ? point.points : 0;
}

/**
 * Get the user's last submitted solution.
 * @param {number|string} userId - The user ID.
 * @returns {Promise<Object|null>} The last solution or null if not found.
 */
async function getLastSolution(userId) {
  return await Solution.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });
}

module.exports = {
  saveSolution,
  getUserPoints,
  getLastSolution,
};
