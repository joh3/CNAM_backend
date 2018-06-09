//import de mongoose
const mongoose = require('mongoose');
const routes = require('../server');


//definition du schéma
const Client = mongoose.Schema({
    nom: String,
    prenom: String,
    email: String,
    numtel: Number,
    adresseFact: String,
    codePostal: Number,
    ville: String,
    mdp: String
});

module.exports = mongoose.model('Client',Client);
