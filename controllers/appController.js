module.exports.getTest = async (req, res) => {
    console.log(global.word)
    res.render('index', {
        solution: global.word
    })
}