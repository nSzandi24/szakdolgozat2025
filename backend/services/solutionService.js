const { Solution } = require('../database');

async function saveSolution(userId, answers) {
  // answers: { weapon, killer, motive, kidnapper, kidnapMotive, ghostskin }
  return await Solution.create({
    userId,
    weapon: answers.weapon,
    killer: answers.killer,
    motive: answers.motive,
    kidnapper: answers.kidnapper,
    kidnapMotive: answers.kidnapMotive,
    ghostskin: answers.ghostskin,
  });
}

module.exports = {
  saveSolution,
};
