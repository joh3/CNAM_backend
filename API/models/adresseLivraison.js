//import de mongoose
const mongoose = require('mongoose');
const routes = require('../server');

const AdresseLivraison = mongoose.Schema({
    nomLieu: String,
    adresse: String,
    codePostal: Number,
    ville: String
});

module.exports = mongoose.model('AdresseLivraison',AdresseLivraison);