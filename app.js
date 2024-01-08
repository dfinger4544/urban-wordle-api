require('dotenv').config();
const express = require('express')
const mongoose = require("mongoose");
const schedule = require('node-schedule');

// model for creating and checking todays soltion
const Solution = require('./models/solutionModel')

// set up todays word if it does not exist
const checkTodaysWord = async () => {
    const todaysWord = await Solution.getTodaysWord()
    if (!todaysWord) await Solution.setTodaysWord()
}
// creates a new word every day at midnight
schedule.scheduleJob('0 0 0 * * *', checkTodaysWord);

// app setup
const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(express.json());

// routes
const apiRoutes = require('./routes/apiRoutes')
const appRoutes = require('./routes/appRoutes')

app.use('/api', apiRoutes)
app.use('/', appRoutes)

const port = 3000
mongoose
.connect(process.env.MONGODB_URI)
.then(async result => {
    // manually run check in case app was down
    await checkTodaysWord()

    // start app
    app.listen(port, async () => {
        console.log(`App listening on port ${port}`)
    });
})
.catch(err => {
  console.log(err);
});
