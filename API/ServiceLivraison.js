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


    //Recupere la liste des commandes a livrer pour un livreur donné
    apiRoutes.get('/tournee/:livreurid',function(req,res){
        if(!req.params.livreurid){
            return res.status(400).json({success:false,message:'Livreur id necessaire'});
        }
        connection.query('select c.*, al.adresse, al.codePostal, al.ville from livreur l join tournee t on t.idLivreur = l.idLivreur join commande c on c.idTournee = t.idTournee join Adresse al on al.idAdresse = c.idAdresse where l.idLivreur = ? order by c.ordre',[req.params.livreurid], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //Renvoi les infos d'un client en fonction du numéro de commande
    apiRoutes.get('/client/commande/:idCommande',function(req,res){
        if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
        connection.query('select cli.nom, cli.prenom, cli.email, cli.numTel from client cli join commande com on com.idClient = cli.idClient where com.idCommande = ?',[req.params.idCommande], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //Renvoi le contenu d'une commande en fonction du numéro de commande
    apiRoutes.get('/article/commande/:idCommande',function(req,res){
        if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
        connection.query('select a.prixHT, a.libelle, c.quantite from contenir c join article a on a.idArticle = c.idArticle where c.idCommande = ?',[req.params.idCommande], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //Requete generale pour filtrer sur l'etatCommande que l'on veut
    apiRoutes.get('/filterCommands',urlencodedParser,function(req,res){
        connection.query('SELECT * FROM Commande WHERE etatCommande = ?',[req.body.etatCommande],function(error,results,fields){
            if (error){
                throw error;
            } else {
                return res.status(200).json(results);
            }
        })
    })

app.use(apiRoutes);

}