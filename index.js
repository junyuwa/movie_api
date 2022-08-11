// require express the framework
const express = require('express');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

let topMovies = [
    { title: 'Cloud Atlas' },
    { title: 'Rocky Horror Picture Show' },
    { title: 'Bitter Moon' },
    { title: 'Old Boy' },
    { title: 'The Pietà' },
    { title: 'Babel' },
    { title: 'Paris I Love You' },
    { title: 'Portrait of A Lady on Fire' },
    { title: 'Undine' },
    { title: 'Sprited Away' }
];


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('This is a movie API!')
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
