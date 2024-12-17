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
    const { name, id, url, types } = req.body;
    const pokemonId = parseInt(id, 10); // Ép kiểu thành số
    const filteredTypes = Array.isArray(types)
      ? types.filter((item) => item && item.trim() !== "")
      : []; // Make sure types is an array before apply filter method
    // Check missing data
    if (!name || !pokemonId || !url || filteredTypes.length === 0) {
      const exception = new Error(`Missing required data.`);
      exception.statusCode = 401;
      throw exception;
    }
    // Check types length
    if (filteredTypes.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types.`);
      exception.statusCode = 401;
      throw exception;
    }
    // Check valid pokemon types
    const validPokemonTypes = [
      "bug",
      "dragon",
      "fairy",
      "fire",
      "ghost",
      "ground",
      "normal",
      "psychic",
      "steel",
      "dark",
      "electric",
      "fighting",
      "flyingText",
      "grass",
      "ice",
      "poison",
      "rock",
      "water",
    ];
    const allExist = filteredTypes.every((item) =>
      validPokemonTypes.includes(item)
    ); // Validate all item in filteredTypes included in validPokemonTypes
    if (!allExist) {
      const exception = new Error(`Pokémon's type is invalid.`);
      exception.statusCode = 401;
      throw exception;
    }
    // Check if id or name exists in the database
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data: pokemons } = db;
    const foundPokemon = pokemons.find(
      (pokemon) => pokemon.id === pokemonId || pokemon.name === name
    );
    if (foundPokemon) {
      const exception = new Error(`The Pokémon already exists.`);
      exception.statusCode = 401;
      throw exception;
    }
    // Create new pokemon
    const newPokemon = { id: pokemonId, name, types: filteredTypes, url };
    // Add new pokemon to pokemons JS object
    pokemons.push(newPokemon);
    const newTotalPokemons = pokemons.length;
    // Add pokemons JS object to db JS object
    db.data = pokemons;
    db.totalPokemons = newTotalPokemons;
    // Convert db JS object to JSON string
    db = JSON.stringify(db);
    // Write and save to db.json
    fs.writeFileSync("db.json", db);
    // Post send response
    res.status(200).send(newPokemon);
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
    const allowUpdate = ["name", "url", "types"]; // Cannot edit the id
    const { pokemonId } = req.params;
    const id = parseInt(pokemonId, 10); // Ép kiểu thành số
    const updates = req.body;
    const updateKeys = Object.keys(updates);
    // Find update request keys that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      const exception = new Error(`Update field not allow`);
      exception.statusCode = 401;
      throw exception;
    }
    // Check valid types
    if (req.body.types) {
      const types = req.body.types;
      // Check if types empty
      const filteredTypes = Array.isArray(types)
        ? types.filter((item) => item && item.trim() !== "")
        : []; // Make sure types is an array before apply filter method
      // Check types length
      console.log("types", filteredTypes);
      if (filteredTypes.length === 0) {
        const exception = new Error(`Pokémon must have at least one type.`);
        exception.statusCode = 401;
        throw exception;
      }
      if (filteredTypes.length > 2) {
        const exception = new Error(`Pokémon can only have one or two types.`);
        exception.statusCode = 401;
        throw exception;
      }
      // Check valid types
      const validPokemonTypes = [
        "bug",
        "dragon",
        "fairy",
        "fire",
        "ghost",
        "ground",
        "normal",
        "psychic",
        "steel",
        "dark",
        "electric",
        "fighting",
        "flyingText",
        "grass",
        "ice",
        "poison",
        "rock",
        "water",
      ];
      const allExist = filteredTypes.every((item) =>
        validPokemonTypes.includes(item)
      ); // Validate all item in filteredTypes included in validPokemonTypes
      if (!allExist) {
        const exception = new Error(`Pokémon's type is invalid.`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    // Get database
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data: pokemons } = db;
    // Check name exists
    if (req.body.name) {
      const name = req.body.name;
      // Filter out this pokemon by id before find by name
      const otherPokemons = pokemons.filter((pokemon) => pokemon.id !== id);
      const foundPokemonName = otherPokemons.find(
        (pokemon) => pokemon.name === name
      );
      if (foundPokemonName) {
        const exception = new Error(`The Pokémon name already exists.`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    // Find book by id
    const targetIndex = pokemons.findIndex((pokemon) => pokemon.id === id);
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    // Start update pokemon
    const updatedPokemon = { ...db.data[targetIndex], ...updates };
    db.data[targetIndex] = updatedPokemon;
    // Convert db JS object to JSON string
    db = JSON.stringify(db);
    // Write and save to db.json
    fs.writeFileSync("db.json", db);
    // Update response
    res.status(200).send(updatedPokemon);
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
    const { pokemonId } = req.params;
    const id = parseInt(pokemonId, 10); // Ép kiểu thành số
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data: pokemons } = db;
    // Find pokemon by id
    const targetIndex = pokemons.findIndex((pokemon) => pokemon.id === id);
    // Valid pokemon id
    if (targetIndex < 0) {
      const exception = new Error(`Pokemon not found`);
      exception.statusCode = 404;
      throw exception;
    }
    // Filter db pokemons object (this means remove the matched item from db)
    const newPokemons = pokemons.filter((pokemon) => pokemon.id !== id);
    const newTotalPokemons = newPokemons.length;
    db.data = newPokemons;
    db.totalPokemons = newTotalPokemons;
    // Convert db JS object to JSON string
    db = JSON.stringify(db);
    // Write it back and save to db.json
    fs.writeFileSync("db.json", db);
    // Delete send response
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
