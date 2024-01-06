const express = require('express')
const { getRandomWord, define } = require('./models/urbanModel')

// app setup
const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))

// routes
const appRoutes = require('./routes/appRoutes')
app.use('/', appRoutes)

const port = 3000
app.listen(port, async () => {
    global.word = await define('loner ')
    console.log(`Example app listening on port ${port}`)
})