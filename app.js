require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");

// model for creating and checking todays soltion
const Definition = require("./models/definitionModel");
const Solution = require("./models/solutionModel");

// set up todays word if it does not exist
const checkTodaysWord = async () => {
  // capture curated words from Urban Dictionary
  await Definition.captureDefinitions(1); // capture # of pages

  // get todays word if it exist, else set todays word (and catchup if there are no records for the last 1 - 7 days)
  await Solution.deleteMany({}); // temp until actual daily word within criteria
  let todaysWord = await Solution.getTodaysWord();
  if (!todaysWord) todaysWord = await Solution.setTodaysWord(); // will try to grab the last five days of words (incase any are missing)

  const total_words = await Definition.countDocuments();
  console.log(`There are ${total_words} words in the database`);
  console.log(`Todays word is ${todaysWord.word}`);
};
// creates a new word every day at midnight
schedule.scheduleJob("0 0 0 * * *", checkTodaysWord);

// app setup
const app = express();
app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());

// routes
const apiRoutes = require("./routes/apiRoutes");
const appRoutes = require("./routes/appRoutes");

app.use("/api", apiRoutes);
app.use("/", appRoutes);

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
