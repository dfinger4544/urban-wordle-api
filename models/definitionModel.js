const mongoose = require("mongoose");

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const axios = require("axios");
const urban_api = "http://api.urbandictionary.com/v0";

const Schema = mongoose.Schema;

const DefinitionSchema = new Schema({
  _id: { type: String, required: true },
  definition: String,
  example: String,
});

// check and insert the last curated word on urban dictionary
// if the word was used before, skip
// choose the word of the day as todays word, if it meets criteria, else choose a random word that has not been used this month
DefinitionSchema.static("captureDefinitions", async function (catchup = -1) {
  // Launch the browser and navigate to UD
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  let words = [], // final variable of words to insert
    list, // list of words on a single page
    page_num = 1, // page iterator
    $; // jquery (cheerio) page content

  await page.goto(`https://www.urbandictionary.com/?page=${page_num}`);

  // page loop - -1 is all words
  while (catchup && catchup !== 0) {
    console.log(`Processing page ${page_num}`);
    // get words on page
    $ = cheerio.load(await page.content());
    list = $("a.word");

    // if no list, leave loop
    if (!list.length) break;

    // add defintions
    words = [...list].map((element) => element.children[0].data);
    for (let index = 0; index < words.length; index++) {
      try {
        const word = words[index];
        const response = await this.define(word);
        const _id = response.word;

        const newDefinition = new this({
          _id,
          ...response,
        });

        await newDefinition.save();
        console.log(`${newDefinition._id} SAVED to Definitions`);
      } catch (e) {
        if (e.keyValue) {
          console.log(`${e.keyValue._id} EXISTS in Definitions`);
        } else {
          console.log(e);
        }
      }
    }

    // navigate to next page
    await page.goto(`https://www.urbandictionary.com/?page=${++page_num}`);
    catchup--;
  }
  await browser.close();
});

DefinitionSchema.static("define", async function (word) {
  const endpoint = urban_api + `/define?term=${word}`;
  const defintion = (await axios.get(endpoint)).data.list[0];

  return defintion;
});

module.exports = mongoose.model("Definition", DefinitionSchema);
