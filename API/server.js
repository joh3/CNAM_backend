const express = require('express');
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
});
