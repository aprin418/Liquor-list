require("dotenv").config();
const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./config/ppConfig");
const isLoggedIn = require("./middleware/isLoggedIn");
const axios = require("axios");
const db = require("./models");
const methodOverride = require("method-override");

const SECRET_SESSION = process.env.SECRET_SESSION;

app.set("view engine", "ejs");

app.use(
  session({
    secret: SECRET_SESSION, // What we actually will be giving the user on our site as a session cookie
    resave: false, // Save the session even if it's modified, make this false
    saveUninitialized: true, // If we have a new session, we save it, therefore making that true
  })
);

app.use(flash());
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Add a session
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use(require("morgan")("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(layouts);

app.get("/", (req, res) => {
  res.render("index");
});

// app.get("/profile", (req, res) => {
//   res.render("profile");
// });

app.use("/auth", require("./controllers/auth"));

app.get("/home", function (req, res) {
  res.render("home");
});

app.get("/results/:ingredient", function (req, res) {
  let userInput = req.query.q;
  // console.log(userInput);
  let results = `http://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${userInput}`;
  // Use request to call the API
  axios.get(results).then((response) => {
    let results = response.data;
    console.log(results);
    res.render("results", { results: response.data });
  });
});

//prettier-ignore
app.get("/drinks/:idDrink", function (req, res) {
  // console.log(userInput);
  let idDrink = req.params.idDrink;
  let drinkInfo = `http://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`;
  // Use request to call the API
  axios.get(drinkInfo).then((response) => {
    let ingArray = [];
    let drinkInfo = response.data.drinks[0];
    for (const [key, value] of Object.entries(drinkInfo)) {
      if (key.includes("strIngredient")) {
        ingArray.push(value);
      }
    }
    // console.log('Here is drink info')
    // console.log(drinkInfo);
    // console.log(drinkInfo);
    let amountArray = [];
    // let drinkInfo = response.data.drinks[0];
    for (const [key, value] of Object.entries(drinkInfo)) {
      if (key.includes("strMeasure")) {
        amountArray.push(value);
      }
    }
    res.render("details", { drinkIngredient: ingArray, drinkInfo: response.data, drinkInstructions: amountArray });
  });
});

app.get("/drinks/name/:name", function (req, res) {
  // console.log(userInput);
  let name = req.params.name;
  let drinkName = `http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`;
  // Use request to call the API
  axios.get(drinkName).then((response) => {
    console.log(drinkName);
    let ingArray = [];
    let drinkInfo = response.data.drinks[0];
    for (const [key, value] of Object.entries(drinkInfo)) {
      if (key.includes("strIngredient")) {
        ingArray.push(value);
      }
    }
    // console.log('Here is drink info')
    // console.log(drinkInfo);
    let amountArray = [];
    // let drinkInfo = response.data.drinks[0];
    for (const [key, value] of Object.entries(drinkInfo)) {
      if (key.includes("strMeasure")) {
        amountArray.push(value);
      }
    }
    // console.log(drinkInfo);
    res.render("favesDetails", {
      drinkIngredient: ingArray,
      drinkInfo: response.data,
      drinkInstructions: amountArray,
    });
  });
});

app.post("/faves", function (req, res) {
  db.faves
    .findOrCreate({
      where: {
        name: req.body.title,
      },
    })
    .then(() => {
      res.redirect("/faves");
    });
});

app.get("/faves", (req, res) => {
  db.faves.findAll().then((result) => {
    console.log(result);
    // let array = [];
    // result.forEach((drinkName) => {
    //   array.push(drinkName.dataValues.name);
    // });
    // console.log("this is an array", array);
    res.render("faves", { foundFaves: result });
  });
});

app.delete("/faves/:id", (req, res) => {
  db.faves.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.redirect("/faves");
});

app.get("/myob", isLoggedIn, (req, res) => {
  res.render("myob");
});

// Add this below /auth controllers
app.get("/profile", isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render("profile", { id, name, email });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
