//import de mongoose
const mongoose = require('mongoose');
const routes = require('../server');

const Tournee = new mongoose.Schema({
    dateHeurePosition: Date,
    coordonneesPosition: Number
});

module.exports = mongoose.model('Tournee',Tournee);