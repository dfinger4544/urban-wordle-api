const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Definition = require("./definitionModel");

const Schema = mongoose.Schema;

const SolutionSchema = new Schema({
  _id: {
    type: Date,
    default: DateTime.now().toSQLDate(),
    required: true,
  },
  word: { type: String, required: true },
  definition: String,
  example: String,
});

// check and insert the last curated word on urban dictionary
// if the word was used before, skip
// choose the word of the day as todays word, if it meets criteria, else choose a random word that has not been used this month
SolutionSchema.static("setTodaysWord", async function (max_word_length = 5) {
  const definition = await Definition.findOne({
    _id: "sail the seven seas",
  });
  definition.word = definition._id;
  delete definition._id;
  delete definition._v;

  const solution = new this({
    ...definition,
  });
  await solution.save();

  return solution;
});

SolutionSchema.static(
  "getTodaysWord",
  async function (date = DateTime.now().toSQLDate()) {
    const todaysWord = await this.where("_id", date);
    return todaysWord[0];
  }
);

/* SolutionSchema.static("score", async function (word) {
  const guess = await this.define(word);
  const todaysWord = await this.getTodaysWord();

  const isWord = guess ? true : false,
    result = [],
    solution = todaysWord.word.toUpperCase(),
    checked = {};
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    let score = 0;

    if (!checked[letter]) checked[letter] = 1;
    else checked[letter]++;

    if (letter === solution[i]) score += 2;
    else if (solution.includes(letter) && checked[letter] !== 2) score += 1;

    result.push({
      letter,
      score,
    });
  }

  // return if its a word and the placement of letter scores
  return {
    isWord,
    result,
  };
}); */

module.exports = mongoose.model("Solution", SolutionSchema);
