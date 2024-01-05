const urbanCtrl = require('./models/urban')

const init = async () => {
    const solution = await urbanCtrl.getRandomWord(500, 5)
    console.log (solution)

    const define = await urbanCtrl.define(solution.word)
    console.log(define)

}

init()