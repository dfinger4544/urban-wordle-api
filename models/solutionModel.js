const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const axios = require("axios");
const urban_api = "http://api.urbandictionary.com/v0";

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

SolutionSchema.static("setTodaysWord", async function (catchup = 0) {
  // Launch the browser and navigate to page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://www.urbandictionary.com/");

  let words = [], // final variable of words to insert
    list, // list of words on a single page
    page_num = 1, // page iterator
    $; // jquery (cheerio) page content

  // page loop
  while (catchup || !list.length) {
    // get words on page
    $ = cheerio.load(await page.content());
    list = $("a.word");

    // reduce catchup or slice array
    if (list.length < catchup) {
      catchup -= list.length;
    } else {
      list = $("a.word").slice(0, catchup + 1);
      catchup = 0;
    }

    // push list into array
    words.push(...list);

    // navigate to next page
    await page.goto(`https://www.urbandictionary.com/?page=${++page_num}`);
  }
  await browser.close();
  words = words.map((element) => element.children[0].data);
  console.log(words);

  // load word into db
  for (let index = 0; index < words.length; index++) {
    const _id = DateTime.now().plus({ days: -index }).toSQLDate();
    const word = words[index];
    const response = await this.define(word);

    try {
      const newSolution = new this({
        _id,
        ...response,
      });
      await newSolution.save();
    } catch (e) {
      console.log(`A word already exists for ${_id}`);
    }
  }
});

SolutionSchema.static(
  "getTodaysWord",
  async function (date = DateTime.now().toSQLDate()) {
    const todaysWord = await this.where("_id", date);
    return todaysWord[0];
  }
);

SolutionSchema.static("score", async function (word) {
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
});

SolutionSchema.static("define", async function (word) {
  const endpoint = urban_api + `/define?term=${word}`;
  const defintion = (await axios.get(endpoint)).data.list[0];

  return defintion;
});

module.exports = mongoose.model("Solution", SolutionSchema);
