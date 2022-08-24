const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  
//   create models with the schema used
// anything will come out lowercased and pluralized on the other side
  let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
  
// export the models
module.exports.Movie = Movie;
module.exports.User = User;