require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const { DateTime } = require("luxon");

// model for creating and checking todays soltion
const Definition = require("./models/definitionModel");
const Solution = require("./models/solutionModel");

// set up todays word if it does not exist
const checkTodaysWord = async () => {
  const today = DateTime.now().toSQLDate();

  // capture curated words from Urban Dictionary
  const checkedToday = await Definition.exists({
    timestamp: today,
  });
  if (!checkedToday) await Definition.captureDefinitions(1); // capture # of pages

  // get todays word if it exist, else set todays word (and catchup if there are no records for the last 1 - 7 days)
  let todaysWord = await Solution.findOne({ timestamp: today }).populate(
    "definition"
  );
  if (!todaysWord) todaysWord = await Solution.setTodaysWord(today); // will try to grab the last five days of words (incase any are missing)

  const total_words = await Definition.countDocuments();
  console.log(`There are ${total_words} words in the database`);
  console.log(`Todays word is ${todaysWord.definition.word}`);
};
// creates a new word every day at midnight
schedule.scheduleJob("0 0 0 * * *", checkTodaysWord);

// app setup
const app = express();

// routes
const apiRoutes = require("./routes/apiRoutes");

app.use("/", apiRoutes);
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message,
  });
});

const port = 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async (result) => {
    // manually run check in case app was down
    await checkTodaysWord();

    // start app
    app.listen(port, async () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
