/*const express = require('express');
const bodyParser = require('body-parser');

const hostname = 'localhost';
const port = 3000;

app = express();
require('./ServicePriseCommande')(app);
require('./ServiceLivraison')(app);
require('./ServiceRestaurant')(app);
require('./auth')(app)

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.listen(port,function(){
    console.log("Server running on http://"+hostname+":"+port)
});*/


//Import des dépendances
const app = require('express')();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const hostname = 'localhost';
const port = 3000;

//ajout des fichiers a require
require('./ServicePriseCommande')(app);
require('./ServiceLivraison')(app);
require('./ServiceRestaurant')(app);
require('./auth')(app)

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

server.listen(port,function(){
    console.log("Server running on http://"+hostname+":"+port)
});

//Socket server android mobile
io.on('connection', function (socket) {
	console.log("Une nouvelle connexion est active");
	socket.on('newGeoMobile', function (data) {
		socket.broadcast.emit('newGeoServeur', data);
		console.log(data);
	});
});
