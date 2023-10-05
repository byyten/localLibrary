const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: String,
    enum: ['fiction','reference','poetry','art','vocational','military', 'science fiction']
});

// Virtual for author's URL
GenreSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/genre/${this._id}`;
  });
  
  
// Export model
module.exports = mongoose.model("Genre", GenreSchema);