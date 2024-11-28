const { DateTime } = require("luxon");

const Solution = require("../models/solutionModel");

module.exports.getDefinition = async (req, res, next) => {
  const dayIncrement = req.params.dayIncrement || 0,
    date = DateTime.now().plus({ days: dayIncrement }).toSQLDate();

  const solution = await Solution.findOne({
    timestamp: date,
  }).populate("definition");
  if (!solution) {
    const err = new Error(`No word found for ${date}`);
    err.status = 404;
    return next(err);
  }

  res.json({ status: "Definition retrieved", definition: solution.definition });
};

module.exports.getWord = async (req, res, next) => {
  const dayIncrement = req.params.dayIncrement || 0,
    date = DateTime.now().plus({ days: dayIncrement }).toSQLDate();

  const solution = await Solution.findOne({
    timestamp: date,
  }).populate("definition");
  if (!solution) {
    const err = new Error(`No word found for ${date}`);
    err.status = 404;
    return next(err);
  }

  const masked_word = solution.definition.word.split(" ").map((w) =>
    w.split("").map(() => {
      return {
        letter: "",
        score: 0,
      };
    })
  );

  res.json({ status: "Word retrieved", word: masked_word });
};

module.exports.getHint = async (req, res, next) => {
  const dayIncrement = req.params.dayIncrement || 0,
    date = DateTime.now().plus({ days: dayIncrement }).toSQLDate();

  const solution = await Solution.findOne({
    timestamp: date,
  }).populate("definition");
  if (!solution) {
    const err = new Error(`No word found for ${date}`);
    err.status = 404;
    return next(err);
  }

  const regex = new RegExp(solution.definition.word, "ig"),
    hint = solution.definition.example
      .replace(/[\[\]]/g, "")
      .replace(regex, "[Today's Word]");

  res.json({
    status: "Hint retrieved",
    hint,
  });
};

module.exports.scoreWord = async (req, res, next) => {
  res.json({ status: "Score retrieved" });
};
