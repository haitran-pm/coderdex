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
  const allowedFilter = ["name", "types", "page", "limit"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    // Allow name, types,limit and page query string only
    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    let offset = limit * (page - 1);
    // Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data: pokemons } = db;
    const totalPokemons = pokemons.length;
    // Filter pokemon
    let result = [];
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length // Filter all database first, then on results
          ? result.filter((pokemon) =>
              Array.isArray(pokemon[condition])
                ? pokemon[condition].includes(filterQuery[condition])
                : pokemon[condition] === filterQuery[condition]
            )
          : pokemons.filter((pokemon) =>
              Array.isArray(pokemon[condition])
                ? pokemon[condition].includes(filterQuery[condition])
                : pokemon[condition] === filterQuery[condition]
            );
      });
    } else {
      result = pokemons;
    }
    // Count total result
    const count = result.length;
    // Select number of result by offset
    result = result.slice(offset, offset + limit);
    // Create return object
    const responseObject = {
      count,
      data: result,
      totalPokemons,
    };
    // Send response
    res.status(200).send(responseObject);
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
    const { pokemonId } = req.params;
    const id = parseInt(pokemonId, 10); // Ép kiểu thành số
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data: pokemons } = db;
    const totalPokemons = pokemons.length;

    // Find pokemon by id
    const thisPokemon = pokemons.find((pokemon) => pokemon.id === id);
    // Valid pokemon id
    if (!thisPokemon) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    } else {
      // Define next and previous id
      let prevId = 0;
      let nextId = 0;
      id === 1 ? (prevId = totalPokemons) : (prevId = id - 1);
      id === totalPokemons ? (nextId = 1) : (nextId = id + 1);
      // Find prev pokemon
      const prevPokemon = pokemons.find((pokemon) => pokemon.id === prevId);
      // Find next pokemon
      const nextPokemon = pokemons.find((pokemon) => pokemon.id === nextId);
      // Create response
      const responseObject = {
        data: {
          pokemon: thisPokemon,
          previousPokemon: prevPokemon,
          nextPokemon: nextPokemon,
        },
      };
      res.status(200).send(responseObject);
    }
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
