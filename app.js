//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt= require("mongoose-encryption");
// var md5 = require('md5');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate');


const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// const saltRounds = 10;
//always place this code before mongoose-connect
app.use(session({
  secret: 'Lets do it.',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

//now initialize it

app.use(passport.initialize());
//use passport to setup our session
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  //these were added after the google login
  //findorcreate my jo google id hy wo yha sy aye hy 
  googleId: String,
  secret: String
});
//below schema
userSchema.plugin(passportLocalMongoose);
//from findorcreate
userSchema.plugin(findOrCreate);


//must add before the model

//here was our encrypted code which has been transferred to .env 

// var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// encryptedFields: ['password']  why added that?
//bcz we want to encrypt only password not email
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']  });


const User = new mongoose.model("User", userSchema);

//below the model
passport.use(User.createStrategy());
//only for local
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// for all
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//below serialize and deserilaize
passport.use(new GoogleStrategy({
  clientID: process.env.CIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/Secret",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
//in order to work findorcraeate(as it is not function we have to install mongoose-findorcreate)
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", (req, res) => {
  res.render(__dirname + "/views/home.ejs");
});
//to have a popup for google
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

//to redirect to our secret page
app.get("/auth/google/Secret",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });
app.get("/login", (req, res) => {
  res.render(__dirname + "/views/login.ejs");
});
app.get("/register", (req, res) => {

  res.render(__dirname + "/views/register.ejs");
});
app.get("/secrets", (req, res) => {

  if (req.isAuthenticated()) {
    res.render(__dirname + "/views/secrets.ejs")
  } else {
    res.redirect("/login")
  }

});

app.post("/register", (req, res) => {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }



    // Value 'result' is set to false. The user could not be authenticated since the user is not active
  });
});

//that is how you logout
app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


app.post("/login", (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  })
  // will use passport to authenticate them
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }

  })
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
