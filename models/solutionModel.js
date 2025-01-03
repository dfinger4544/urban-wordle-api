const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Definition = require("./definitionModel");

const Schema = mongoose.Schema;

const SolutionSchema = new Schema({
  timestamp: {
    type: Date,
    default: DateTime.now().toSQLDate(),
    require: true,
  },
  definition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Definition",
    required: true,
  },
});

// check and insert the last curated word on urban dictionary
// if the word was used before, skip
// choose the word of the day as todays word, if it meets criteria, else choose a random word that has not been used this month
SolutionSchema.static("setTodaysWord", async function (timestamp) {
  let definition = await Definition.exists({
    timestamp,
  });
  if (!definition)
    definition = (
      await Definition.aggregate([
        {
          $lookup: {
            from: "solutions",
            localField: "_id",
            foreignField: "definition",
            as: "s",
          },
        },
        {
          $match: {
            "s.definition": {
              $exists: false,
            },
          },
        },
        { $limit: 1 },
      ])
    )[0];

  const solution = new this({
    timestamp,
    definition: definition._id,
  });
  await solution.save();

  return solution.populate("definition");
});

module.exports = mongoose.model("Solution", SolutionSchema);
