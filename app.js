require ('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded ({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});


app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", async function(req, res){

    const newUser = new User({

        email: req.body.username,
        password: req.body.password

    });

    try{

        await newUser.save()
        res.render("secrets");

    } catch(err){

        console.log(err);
	res.status(500).send("Internal Server Error");
    }

});



app.post("/login", async function(req, res) {

    try {
        const foundUser = await User.findOne({email: req.body.username});

        if (!foundUser) {
            res.status(404).send("User not found");

        } else {
            if (foundUser.password === req.body.password) {
                res.render("secrets");

            } else {
                res.status(401).send("Incorrect password");
            }
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }

});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});