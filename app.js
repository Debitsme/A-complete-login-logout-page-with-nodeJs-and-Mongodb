//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt= require("mongoose-encryption");
var md5 = require('md5');
const bcrypt = require('bcrypt');



const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
const saltRounds = 10;


mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//must add before the model

//here was our encrypted code which has been transferred to .env 

// var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// encryptedFields: ['password']  why added that?
//bcz we want to encrypt only password not email
// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']  });


const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render(__dirname + "/views/home.ejs");
});
app.get("/login", (req, res) => {
  res.render(__dirname + "/views/login.ejs");
});
app.get("/register", (req, res) => {

  res.render(__dirname + "/views/register.ejs");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    const userLogin = new User({
      email: req.body.username,
      password: hash
    });
    //now we mostly write err in the save statment
    userLogin.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });

});

app.post("/login", (req, res) => {
  const emailLogin = req.body.username;
  const passwordLogin = req.body.password;
  User.findOne({ email: emailLogin }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      if (data) {
        bcrypt.compare(passwordLogin, data.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });


      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
