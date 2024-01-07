const Urban = require('../models/urbanModel')

module.exports.getDefinition = async (req, res) => {
    const response = await Urban.score(req.params.word)
    res.send(response)
}