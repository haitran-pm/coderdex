var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ message: "Nice to meet you at CoderDex" });
});

/* Book router */
const pokemonRouter = require("./pokemon.api.js");
router.use("/pokemons", pokemonRouter);

/* Data router */
// const dataRouter = require("./data.api.js");
// router.use("/data", dataRouter);

module.exports = router;
