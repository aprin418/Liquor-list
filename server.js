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
    // console.log(results.response.data);
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

app.post("/drinks/name/:name", function (req, res) {
  let drinkId = req.body.drinkId;
  // console.log(userInput);
  let name = req.params.name;
  let drinkName = `http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`;
  // Use request to call the API
  axios.get(drinkName).then((response) => {
    // console.log(drinkName);
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
    db.note
      .findAll({
        where: {
          // this is what ties a note to its favorite
          faveId: drinkId,
        },
      })
      .then((foundNotes) => {
        console.log("=======================found notes================");
        console.log(foundNotes);
        res.render("favesDetails", {
          drinkIngredient: ingArray,
          drinkInfo: response.data,
          drinkInstructions: amountArray,
          allNotes: foundNotes,
          drinkId: drinkId,
        });
      });
  });
});

app.post("/faves", isLoggedIn, function (req, res) {
  let userInfo = req.user.get();
  db.faves
    .findOrCreate({
      where: {
        name: req.body.title,
        userId: userInfo.id,
      },
    })
    .then((createdFaves) => {
      // console.log("Here is created faves");
      // console.log(createdFaves);
      res.redirect("/faves");
    });
});

app.get("/faves", (req, res) => {
  db.faves.findAll().then((result) => {
    console.log("____________________found faves________________");
    console.log(result);
    db.note.findAll().then((resultNote) => {
      res.render("faves", { foundFaves: result, foundNotes: resultNote });
    });
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

app.delete("/notes/:id", (req, res) => {
  db.note.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.redirect("/faves");
});

app.get("/myob", isLoggedIn, (req, res) => {
  res.render("myob");
});

// app.put('/edit:id', (req, res) => {
//   db.comment.update(
//     req.body,
//     {
//       where: {id: req.params.id}
//     }
//   ).then( updateComment => {
//     console.log("Comment Updated")
//     res.redirect()
//   })
// })

app.post("/notes", isLoggedIn, function (req, res) {
  let userInfo = req.user.get();
  db.note
    .create({
      userId: userInfo.id,
      content: req.body.note,
      faveId: req.body.drinkId,
    })
    .then((createdNote) => {
      console.log("_______created note_______");
      console.log(createdNote);
      res.redirect("/faves");
    });
});

// Add this below /auth controllers
app.get("/profile", isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render("profile", { id, name, email });
});

//prettier-ignore
app.put("/faves/:id", (req, res) => {
  let noteId = req.params.id;
  // console.log(
  //   "++++++++++++++++++note id++++++++++++++++++++++++++++++++++++++++"
  // );
  // console.log(noteId);
  db.note.update({ content: req.body.update }, { where: {id: noteId} })
    .then(function (updateNote) {
      console.log("____________updated note________________");
      console.log(updateNote);
      res.redirect("/faves");
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
