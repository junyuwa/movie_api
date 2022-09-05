// require express the framework
const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const mongoose = require('mongoose');
const Models = require('./models.js');
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb://localhost:27017/movie_api');


const Movies = Models.Movie;
const Users = Models.User;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// data security checks
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const { check, validationResult } = require('express-validator');

// let users = [
//     {
//         "id": 1,
//         "name": "Daniel",
//         "favMovies": ["Babel"]
//     }
// ];
// let movies = [
//     {
//         "title": "Rocky Horror Picture Show",
//         "director": {
//             "name": "Jim Sharman",
//             "bio": "James David Sharman is an Australian director and writer for film and stage with more than 70 productions to his credit.",
//             "birth-year": 1945
//         },
//         "description": "sweethearts Brad (Barry Bostwick) and Janet (Susan Sarandon), stuck with a flat tire during a storm, discover the eerie mansion of Dr. Frank-N-Furter (Tim Curry), a transvestite scientist.",
//         "genre": {
//             "name": "horror",
//             "description": "Horror is a genre of speculative fiction which is intended to frighten, scare, or disgust."
//         },
//         "imageURL": "https://en.wikipedia.org/wiki/The_Rocky_Horror_Picture_Show#/media/File:Original_Rocky_Horror_Picture_Show_poster.jpg"
//     },
//     {
//         "title": "Bitter Moon",
//         "director": {
//             "name": "Roman Polanski",
//             "bio": "Raymond Roman Thierry Polánski is a Polish and French film director, producer, screenwriter, and actor. During his career Polanski has received five Oscar nominations, winning the Best Director in 2003 for The Pianist",
//             "birth-year": 1933
//         },
//         "description": "A cool married couple strike up an unlikely friendship on a cruise liner with wheelchair-bound Peter Coyote, a dissolute writer who takes it upon himself to teach Grant the secrets of the erotic arts so that he can satisfy both Scott-Thomas and Coyote's wife, Emmanuelle Seigner.",
//         "genre": {
//             "name": "romance",
//             "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
//         },
//         "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRyZLp-MO55bKWORf004J_Eb0GQSRN_Lzz_K5AiuKX9wlGdIOFR"
//     },
//     {
//         "title": "Babel",
//         "director": {
//             "name": "Alejandro González Iñárritu",
//             "bio": "Alejandro González Iñárritu is a Mexican filmmaker and screenwriter. He is primarily known for making modern psychological drama films about the human condition.",
//             "birth-year": 1963
//         },
//         "description": "An accident connects four groups of people on three different continents: two young Moroccan goatherds, a vacationing American couple (Brad Pitt, Cate Blanchett), a deaf Japanese teen and her father, and a Mexican nanny who takes her young charges across a border without parental permission.",
//         "genre": {
//             "name": "drama",
//             "description": "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone"
//         },
//         "imageURL": "https://images.justwatch.com/poster/72105421/s718/babel.%7Bformat%7D"
//     },
//     {
//         "title": "2046",
//         "director": {
//             "name": "Wong Kar-wai",
//             "bio": "Wong Kar-wai BBS is a Hong Kong film director, screenwriter, and producer. His films are characterised by nonlinear narratives, atmospheric music, and vivid cinematography involving bold, saturated colours.",
//             "birth-year": 1958
//         },
//         "description": "A train in a futuristic landscape takes passengers to a place where they can recapture their memories, a place from which no one has ever returned. This is the premise of a novel by the womanizing sci-fi writer Chow (Tony Leung Chiu Wai), who engages in passionate affairs with a series of intriguing women he meets at the Oriental Hotel in Hong Kong. As Chow's lovers offer him inspiration for his writing, reality blends with fiction, and the past commingles with the future.",
//         "genre": {
//             "name": "romance",
//             "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
//         },
//         "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSRX8vILxDRnQtHD5Ekd6UTEIcB3-YoWylAkdcVudiBN4NCFjGI"
//     },
//     {
//         "title": "Undine",
//         "director": {
//             "name": "Christian Petzold",
//             "bio": "Christian Petzold is a German film director",
//             "birth-year": 1960
//         },
//         "description": "A woman works as a historian who specializes in the urban development of modern-day Berlin. When the man she loves betrays her, she must kill him and return to the water in a reimagining of the ancient myth of Undine.",
//         "genre": {
//             "name": "romance",
//             "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
//         },
//         "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQfoGIk8RHltU2UNTQRH-KJvaPG9fwj5CK9nvKWc_HgxevCSpo-"
//     },
// ];

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" })
app.use(morgan("combined", { stream: accessLogStream }));

// CREATE
// new user register
app.post("/users", [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + "already exists");
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }).then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).send("ERROR:" + error)
                    })
            }
        }).catch((error) => {
            console.log(error);
            res.status(500).send("ERROR:" + error);
        });
});

// add movies to users' fav movie list
app.post('/users/:Username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { Favmovies: req.params.movieID }
    },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// READ
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find().then((movies) => res.status(201).json(movies))
        .catch((error) => {
            console.log(error);
            res.status(500).send("ERROR:" + error);
        });
});

// find a movie by title
app.get('/movies/:movieTitle', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.movieTitle })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// find a genre by name
app.get("/movies/genres/:genreName", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})

// find a director by name
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})


// UPDATE
// update a user's info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// DELETE
// delete a movie from user's fav movie list
app.delete("/users/:Username/:movieID", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $pull: { Favmovies: req.params.movieID }
        },
        { new: true }, // This line makes sure that the updated document is returned

        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// deregister a user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});




app.get("/", (req, res) => {
    res.send("This is a movie API!")
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
