const Solution = require('../models/solutionModel')

module.exports.getDefinition = async (req, res) => {
    const response = await Solution.score(req.params.word)
    res.send(response)
}