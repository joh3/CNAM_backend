const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bodyPars = bodyParser.json();


const urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){
    var connection = mysql.createConnection({
        connectionLimit: 50,
        host: 'localhost',
        port: '8889',
        user: 'root',
        password: 'root',
        multipleStatements: true,
        database: 'Pizzatologue'
    });

    //connect to mysql
    connection.connect(function(error){
        if(error){
            throw error;
        }
        else {
            console.log('Connected');
        }
    })
    const apiRoutes = express.Router();

    apiRoutes.get('/validCommands',function(req,res){
        var sql = "SELECT * FROM Commande WHERE etatCommande = 'Validée'"
        connection.query(sql,function(error,results,fields){
            if (error) {
                throw error;
                console.log('Erreur requete SQL');
            } else {
                return res.status(200).json(results);
            }
        })
    })

    apiRoutes.get('/attrCommands',function(req,res){
        var sql = "SELECT * FROM Commande WHERE etatCommande = 'Attribuée'"
        connection.query(sql,function(error,results,fields){
            if (error) {
                throw error;
                console.log('Erreur requete SQL');
            } else {
                return res.status(200).json(results);
            }
        })
    })

    apiRoutes.put('/majCommands',urlencodedParser,function(req,res){
        //var sql = "UPDATE Commande SET etatCommande = ? WHERE idCommande = ?";
        //var majParameters = [req.body.idCommande,req.body.etatCommande];
        connection.query('UPDATE Commande SET etatCommande = ? WHERE idCommande = ?',[req.body.etatCommande,req.body.idCommande],function(error,results,fields){
            if (error) {
                throw error;
            } else {
                return res.status(200).json(results);
            }
        })
    })

app.use(apiRoutes);

}