var express = require("express");
var router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

/**
 * params: /
 * description: get all pokemons
 * query:
 * method: get
 */

router.get("/", (req, res, next) => {
  try {
    res.status(200).send("get all pokemons");
  } catch (error) {
    next(error);
  }
});

/**
 * params: /:pokemonId
 * description: get a pokemon
 * query:
 * method: get
 */

router.get("/:pokemonId", (req, res, next) => {
  try {
    res.status(200).send("get a pokemon");
  } catch (error) {
    next(error);
  }
});

/**
 * params: /
 * description: post a pokemon
 * query:
 * method: post
 */

router.post("/", (req, res, next) => {
  try {
    res.status(200).send("post a pokemon");
  } catch (error) {
    next(error);
  }
});

/**
 * params: /:pokemonId
 * description: update a pokemon
 * query:
 * method: put
 */

router.put("/:pokemonId", (req, res, next) => {
  try {
    res.status(200).send("update a pokemon");
  } catch (error) {
    next(error);
  }
});

/**
 * params: /:pokemonId
 * description: update a pokemon
 * query:
 * method: delete
 */

router.delete("/:pokemonId", (req, res, next) => {
  try {
    res.status(200).send("delete a pokemon");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
