const Solution = require("../models/solutionModel");

module.exports.getTest = async (req, res) => {
  const solution = await Solution.getTodaysWord();
  const masked_word = solution.word.toUpperCase().replace(/[A-Z]/g, "x");

  res.render("index", {
    masked_word,
  });
};
