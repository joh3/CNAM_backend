const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const moment = require('moment');
const bodyPars = bodyParser.json();


const urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){
    var connection = mysql.createConnection({
        connectionLimit: 50,
        host: 'localhost',
        user: 'root',
        password: '',
        multipleStatements: true,
        database: 'pizzatologue_new'
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
        connection.query('select c.*, al.adresse, al.codePostal, al.ville, t.idTournee, t.dateDebut, t.dateFin from livreur l join tournee t on t.idLivreur = l.idLivreur join commande c on c.idTournee = t.idTournee join Adresse al on al.idAdresse = c.idAdresse where l.idLivreur = ?  and t.dateFin is null order by c.ordre',[req.params.livreurid], function (error, results, fields) {
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
        connection.query('select a.prixHT, a.libelle, c.quantite from ligneCommande c join article a on a.idArticle = c.idArticle where c.idCommande = ?',[req.params.idCommande], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //renvoi les infos d'un livreur donné en paramètre
    apiRoutes.get('/livreur/:livreurid',function(req,res){
        if(!req.params.livreurid){
            return res.status(400).json({success:false,message:'Livreur id necessaire'});
        }
        connection.query('select l.idLivreur, l.nom, l.prenom,l.email from livreur l where l.idLivreur = ?',[req.params.livreurid], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //Permet de changer l'état d'une commande grâce a son ID
    apiRoutes.post('/commande/livraison/',urlencodedParser,function(req,res){
        //var sql = "UPDATE Commande SET etatCommande = ? WHERE idCommande = ?";
        //var majParameters = [req.body.idCommande,req.body.etatCommande];
        
        connection.query('UPDATE Commande SET etatCommande = ? WHERE idCommande = ?',[req.body.etatCommande, req.body.idCommande],function(error,results,fields){
            if (error) {
                throw error;
            } else {
                console.log(req.body.etatCommande + " et " + req.body.idCommande);
                return res.status(200).json(results);
            }
        })
    })

    //Permet de changer l'état d'une commande grâce a son ID
    apiRoutes.post('/commande/livraison/debut',urlencodedParser,function(req,res){
        var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        connection.query('UPDATE Tournee SET dateDebut = \''+time+'\' WHERE idTournee = ?',[req.body.idTournee],function(error,results,fields){
            if (error) {
                throw error;
            } else {
                console.log(req.body.idTournee);
                return res.status(200).json(results);
            }
        })
    })

    //Permet de changer l'état d'une commande grâce a son ID
    apiRoutes.post('/commande/livraison/fin',urlencodedParser,function(req,res){
        var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        connection.query('UPDATE Tournee SET dateFin = \''+time+'\' WHERE idTournee = ?',[req.body.idTournee],function(error,results,fields){
            if (error) {
                throw error;
            } else {
                console.log(req.body.idTournee);
                return res.status(200).json(results);
            }
        })
    })

    //Permet de changer l'état d'une commande grâce a son ID
    apiRoutes.post('/livreur/etat',urlencodedParser,function(req,res){
        connection.query('UPDATE Livreur SET statut = ? WHERE idLivreur = ?',[req.body.statut, req.body.idLivreur],function(error,results,fields){
            if (error) {
                throw error;
            } else {
                console.log(req.body.idLivreur + ' et ' + req.body.statut);
                return res.status(200).json(results);
            }
        })
    })

app.use(apiRoutes);

}