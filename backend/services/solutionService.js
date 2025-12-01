const { Solution, Point } = require('../database');

const CORRECT_ANSWERS = {
  weapon: 'Kalapács',
  killer: 'Névtelen alak',
  motive: 'Bogyók',
  kidnapper: 'A 3 kisfiú',
  kidnapMotive: 'Foltok',
  ghostskin: 'Névtelen alak',
};

async function saveSolution(userId, answers) {
  // Save the solution
  await Solution.create({
    userId,
    weapon: answers.weapon,
    killer: answers.killer,
    motive: answers.motive,
    kidnapper: answers.kidnapper,
    kidnapMotive: answers.kidnapMotive,
    ghostskin: answers.ghostskin,
  });

  // Calculate points
  let points = 0;
  for (const key of Object.keys(CORRECT_ANSWERS)) {
    if ((answers[key] || '').trim() === CORRECT_ANSWERS[key]) {
      points += 15;
    }
  }
  // Save or update points for user
  await Point.upsert({ userId, points });
  return points;
}

async function getUserPoints(userId) {
  const point = await Point.findOne({ where: { userId } });
  return point ? point.points : 0;
}

async function getLastSolution(userId) {
  return await Solution.findOne({ where: { userId }, order: [['createdAt', 'DESC']] });
}

module.exports = {
  saveSolution,
  getUserPoints,
  getLastSolution,
};
