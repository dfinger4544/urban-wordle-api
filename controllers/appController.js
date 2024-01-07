module.exports.getTest = async (req, res) => {
    res.render('index', {
        solution: global.word
    })
}