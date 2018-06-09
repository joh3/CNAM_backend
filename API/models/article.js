//import de mongoose
const mongoose = require('mongoose');
const routes = require('../server');

const Article = new mongoose.Schema({
    libelle: String,
    description: String,
    prix: Number,
    type: Number
});

module.exports = mongoose.model('Article',Article);