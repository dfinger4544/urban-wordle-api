const express = require('express')
const router = express.Router()

const apiController = require('../controllers/apiController')

router.get('/score/:word', apiController.getDefinition)

module.exports = router