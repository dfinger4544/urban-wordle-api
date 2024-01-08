const mongoose = require("mongoose");
const { DateTime } = require('luxon')
const axios = require('axios')


const Schema = mongoose.Schema;
const urban_api = 'http://api.urbandictionary.com/v0'

const SolutionSchema = new Schema({
    date: { 
        type: Date,
        default: DateTime.now().toSQLDate(),
        required: true
    },
    word: String,
    definition: String,
    example: String
});

SolutionSchema.static('setTodaysWord', async function (rating_threshold = 5000, length = 5) {
    const endpoint = urban_api + '/random'

    let list, winner
    while (!winner) {
        const response = (await axios.get(endpoint))

        list = response.data.list.sort((a, b) => {
            a.rating = (a.thumbs_up + a.thumbs_down) + (a.thumbs_up - a.thumbs_down)
            b.rating = (b.thumbs_up + b.thumbs_down) + (b.thumbs_up - b.thumbs_down)

            if (a.rating > b.rating) return -1
            if (a.rating < b.rating) return 1
            return 0
        }) // sort but thumbs up - down
        .filter(record => record.rating >= rating_threshold && !record.word.trim().includes(' ')) // remove winners that are phrases

        winner = (length ? list.find(record => record.word.length === length) : list[0])
    }
    const response = await this.define(winner.word)

    const newSolution = new this(response)
    await newSolution.save()
})

SolutionSchema.static('getTodaysWord', async function () {
    const todaysWord = await this.where('date', DateTime.now().toSQLDate())
    return todaysWord[0]
})

SolutionSchema.static('score', async function (word) {
    const guess = await this.define(word)
    const todaysWord = await this.getTodaysWord()

    const isWord = guess ? true : false, result = [], solution = todaysWord.word.toUpperCase(), checked = {}
    for (let i = 0; i < word.length; i++) {
        const letter = word[i]
        let score = 0

        if (!checked[letter]) checked[letter] = 1
        else checked[letter]++

        if (letter === solution[i]) score += 2
        else if (solution.includes(letter) && checked[letter] !== 2) score += 1

        result.push({
            letter,
            score
        })
    }

    // return if its a word and the placement of letter scores
    return {
        isWord,
        result
    }
})

SolutionSchema.static('define', async function (word) {
    const endpoint = urban_api + `/define?term=${word}`
    const defintion = (await axios.get(endpoint)).data.list[0]
    
    return defintion
})

module.exports = mongoose.model('Solution', SolutionSchema)
