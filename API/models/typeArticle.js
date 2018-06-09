//import de mongoose
const mongoose = require('mongoose');
const routes = require('../server');

const TypeArticle = mongoose.Schema({
    idType: Number,
    nom: String
});

module.exports = mongoose.model('TypeArticle',TypeArticle);