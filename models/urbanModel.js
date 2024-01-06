const axios = require('axios')
const url = 'http://api.urbandictionary.com/v0'


module.exports.exists = async (winner) => {
    const endpoint = url + `/define?term=${winner}`
    const defintion = (await axios.get(endpoint)).data.list
    
    return defintion.length ? true : false
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
        //console.log(response)

        list = response.data.list.sort((a, b) => {
            a.rating = (a.thumbs_up + a.thumbs_down) + (a.thumbs_up - a.thumbs_down)
            b.rating = (b.thumbs_up + b.thumbs_down) + (b.thumbs_up - b.thumbs_down)

            if (a.rating > b.rating) return -1
            if (a.rating < b.rating) return 1
            return 0
        }) // sort but thumbs up - down
        .filter(record => record.rating >= rating_threshold && !record.word.trim().includes(' ')) // remove winners that are phrases

        console.log({list: response.data.list.length, winner})
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
