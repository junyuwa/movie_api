// require express the framework
const express = require("express");
const app = express();
const morgan = require("morgan");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

let users = [
    {
        "id": 1,
        "name": "Daniel",
        "favMovies": ["Babel"]
    }
];
let movies = [
    {
        "title": "Rocky Horror Picture Show",
        "director": {
            "name": "Jim Sharman",
            "bio": "James David Sharman is an Australian director and writer for film and stage with more than 70 productions to his credit.",
            "birth-year": 1945
        },
        "description": "sweethearts Brad (Barry Bostwick) and Janet (Susan Sarandon), stuck with a flat tire during a storm, discover the eerie mansion of Dr. Frank-N-Furter (Tim Curry), a transvestite scientist.",
        "genre": {
            "name": "horror",
            "description": "Horror is a genre of speculative fiction which is intended to frighten, scare, or disgust."
        },
        "imageURL": "https://en.wikipedia.org/wiki/The_Rocky_Horror_Picture_Show#/media/File:Original_Rocky_Horror_Picture_Show_poster.jpg"
    },
    {
        "title": "Bitter Moon",
        "director": {
            "name": "Roman Polanski",
            "bio": "Raymond Roman Thierry Polánski is a Polish and French film director, producer, screenwriter, and actor. During his career Polanski has received five Oscar nominations, winning the Best Director in 2003 for The Pianist",
            "birth-year": 1933
        },
        "description": "A cool married couple strike up an unlikely friendship on a cruise liner with wheelchair-bound Peter Coyote, a dissolute writer who takes it upon himself to teach Grant the secrets of the erotic arts so that he can satisfy both Scott-Thomas and Coyote's wife, Emmanuelle Seigner.",
        "genre": {
            "name": "romance",
            "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
        },
        "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRyZLp-MO55bKWORf004J_Eb0GQSRN_Lzz_K5AiuKX9wlGdIOFR"
    },
    {
        "title": "Babel",
        "director": {
            "name": "Alejandro González Iñárritu",
            "bio": "Alejandro González Iñárritu is a Mexican filmmaker and screenwriter. He is primarily known for making modern psychological drama films about the human condition.",
            "birth-year": 1963
        },
        "description": "An accident connects four groups of people on three different continents: two young Moroccan goatherds, a vacationing American couple (Brad Pitt, Cate Blanchett), a deaf Japanese teen and her father, and a Mexican nanny who takes her young charges across a border without parental permission.",
        "genre": {
            "name": "drama",
            "description": "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone"
        },
        "imageURL": "https://images.justwatch.com/poster/72105421/s718/babel.%7Bformat%7D"
    },
    {
        "title": "2046",
        "director": {
            "name": "Wong Kar-wai",
            "bio": "Wong Kar-wai BBS is a Hong Kong film director, screenwriter, and producer. His films are characterised by nonlinear narratives, atmospheric music, and vivid cinematography involving bold, saturated colours.",
            "birth-year": 1958
        },
        "description": "A train in a futuristic landscape takes passengers to a place where they can recapture their memories, a place from which no one has ever returned. This is the premise of a novel by the womanizing sci-fi writer Chow (Tony Leung Chiu Wai), who engages in passionate affairs with a series of intriguing women he meets at the Oriental Hotel in Hong Kong. As Chow's lovers offer him inspiration for his writing, reality blends with fiction, and the past commingles with the future.",
        "genre": {
            "name": "romance",
            "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
        },
        "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSRX8vILxDRnQtHD5Ekd6UTEIcB3-YoWylAkdcVudiBN4NCFjGI"
    },
    {
        "title": "Undine",
        "director": {
            "name": "Christian Petzold",
            "bio": "Christian Petzold is a German film director",
            "birth-year": 1960
        },
        "description": "A woman works as a historian who specializes in the urban development of modern-day Berlin. When the man she loves betrays her, she must kill him and return to the water in a reimagining of the ancient myth of Undine.",
        "genre": {
            "name": "romance",
            "description": "The aim of the genre is simple, showcasing a love story where two people overcome adversity to obtain their happily ever after. "
        },
        "imageURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQfoGIk8RHltU2UNTQRH-KJvaPG9fwj5CK9nvKWc_HgxevCSpo-"
    },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a" })
app.use(morgan("combined", { stream: accessLogStream }));

// CREATE
app.post("/users", (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send("Please enter user name")
    }
});

app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${user.name}'s favorite movies`);
    } else {
        res.status(400).send("The movie is not found!")
    }
});


// READ
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
});

app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("The movie you looked for is not found")
    }
})

app.get("/movies/genres/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("The genre you looked for is not found")
    }
})

app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("The director you looked for is not found")
    }
})

// UPDATE
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send("The user is not found!")
    }
});


// DELETE
app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favMovies = user.favMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been deleted from ${user.name}'s favorite movies`);
    } else {
        res.status(400).send("The movie is not found!")
    }
});

app.delete("/users/:id", (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`user ${id} has been deregistered`);
    } else {
        res.status(400).send("The user is not found!")
    }
});




app.get("/", (req, res) => {
    res.send("This is a movie API!")
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
});
