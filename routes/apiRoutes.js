const express = require("express");
const router = express.Router();

const apiController = require("../controllers/apiController");

// full unmasked definition (word, definition, example)
router.get("/definition/:dayIncrement", apiController.getDefinition);

// masked routes for game
router.get("/definition/:dayIncrement/masked/word", apiController.getWord);
router.get("/definition/:dayIncrement/masked/hint", apiController.getHint);

module.exports = router;
