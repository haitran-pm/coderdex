var express = require("express");
var router = express.Router();
const fs = require("fs");
const { parse } = require("csv-parse");

router.get("/", (req, res, next) => {
  try {
    let pos = 1;
    const cutoff = 721; // Cut off the Pokemon for which we don't have an image source
    let results = { data: [], totalPokemons: cutoff };

    fs.createReadStream("./pokemon.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", (row) => {
        if (pos <= cutoff) {
          let id = pos;
          let name = row[0].toLowerCase();
          let types = [];
          let type1 = row[1].toLowerCase();
          let type2 = row[2].toLowerCase();
          type1 && type2 ? (types = [type1, type2]) : (types = [type1]);
          let url = `/images/${pos}.png`;
          let item = { id, name, types, url };
          results.data.push(Object(item));
        }
        pos++;
      })
      .on("end", function () {
        console.log(results);
        let db = JSON.stringify(results);
        fs.writeFileSync("db.json", db);

        console.log("finished");
      })
      .on("error", function (error) {
        console.log(error.message);
      });

    res.send("done");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
