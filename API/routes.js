const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');


const urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){
    var connection = mysql.createConnection({
        connectionLimit: 50,
        host: 'localhost',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'PizzatologueV2'
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

    //Routes pour client
    apiRoutes.route('/').all(function(req,res){
        res.json({message:"Bienvenue sur l'API test",methode:req.method});
    });

    //ajout d'un compte client
    apiRoutes.post('/client',urlencodedParser,function(req,res){  
        var postData = req.body;
        console.log(req.body)
        connection.query('INSERT INTO client SET ?',postData,function(error,results,fields){
            if (error){
                throw error;
            }
            return res.status(200).json({success:true,message:'Client stocké'})
        })
    });


    apiRoutes.get('/client',function(req,res){
        connection.query('SELECT * from client', function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        });  
    });

    apiRoutes.get('/client/:clientid',function(req,res){
        if(!req.params.clientid){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
        connection.query('SELECT * FROM client c WHERE c.idClient = ?',[req.params.clientid], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });


    apiRoutes.delete('/client/',urlencodedParser,function(req,res){})



    apiRoutes.put('/client',urlencodedParser,function(req,res){})
    //fin routes client

    //début du traitement pour le renvoi des données pour le livreur
    apiRoutes.get('/tournee/:livreurid',function(req,res){
        if(!req.params.livreurid){
            return res.status(400).json({success:false,message:'Livreur id necessaire'});
        }
        connection.query('select c.*, al.adresse, al.codePostal, al.ville from livreur l join tournee t on t.idLivreur = l.idLivreur join commande c on c.idTournee = t.idTournee join adresselivraison al on al.idAdresseLivraison = c.idAdresseLivraison where l.idLivreur = ? order by c.ordre',[req.params.livreurid], function (error, results, fields) {
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

    //Renvoi la liste des articles (catalogue)
    apiRoutes.get('/articles',function(req,res){
        connection.query('SELECT idArticle, libelle, description, prixHT, taux, nom FROM Article, TVA, TypeArticle WHERE TVA.idTVA = Article.idTva and Article.idTypeArticle = TypeArticle.idTypeArticle', function (error, results, fields) {
        if (error){
            throw error;
        }
        return res.json(results);
    });
});
     //Renvoi les infos pour un article passé en paramètre   
    apiRoutes.get('/article/:idArticle',function(req,res){
        if(!req.params.idArticle){
            return res.status(400).json({success:false,message:'Article id necessaire'});
        }
        connection.query('SELECT idArticle, libelle, description, prixHT, taux, nom FROM Article, TVA, TypeArticle WHERE TVA.idTVA = Article.idTva and Article.idTypeArticle = TypeArticle.idTypeArticle and idArticle = ?',[req.params.idArticle],function(error, results, fileds){
            if(error){
                throw error;
            }
            return res.json(results);
        })
    })

    apiRoutes.post('/articles',urlencodedParser,function(req,res){})

    

   app.use(apiRoutes);
}


