const axios = require('axios')
const url = 'http://api.urbandictionary.com/v0'


module.exports.score = async (word) => {
    const endpoint = url + `/define?term=${word}`
    const defintion = (await axios.get(endpoint)).data.list

    const isWord = defintion.length ? true : false, result = [], solution = global.solution.word.toUpperCase(), checked = {}
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
        defintion,
        result
    }
}

module.exports.define = async (winner) => {
    const endpoint = url + `/define?term=${winner}`
    const defintion = (await axios.get(endpoint)).data.list[0]
    
    return defintion
}

module.exports.getRandomWord = async (rating_threshold, length) => {
    const endpoint = url + '/random'

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

    const solution = await this.define(winner.word)
    solution.hint = solution.example.replace(new RegExp(solution.word, "ig"), '~~ Todays Word ~~').replace(new RegExp(solution.word+'s', "g"), '~~ Todays Word ~~')
    delete solution.example 

    return {
        word: solution.word,
        hint: solution.hint
    }
}

module.exports.getTodaysWord = () => {
    return global.solution
}