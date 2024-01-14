const Solution = require("../models/solutionModel");

module.exports.getTest = async (req, res) => {
  const solution = await Solution.getTodaysWord();
  const masked_word = solution.word.toUpperCase().replace(/[A-Z]/g, "x");
  const masked_word_array = masked_word.split(" ");

  res.render("index", {
    masked_words: masked_word_array,
  });
};
