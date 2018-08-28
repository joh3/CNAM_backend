const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bodyPars = bodyParser.json();
const bcrypt = require('bcrypt');


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

     //liste de tous les clients
     apiRoutes.get('/client',function(req,res){
        connection.query('SELECT * from client', function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        });  
    });

    //Renvoi la liste des articles (catalogue)
    apiRoutes.get('/articles',function(req,res){
        connection.query('SELECT idArticle, libelle, description, prixHT, taux, nomCategorie FROM Article, TVA, Categorie WHERE TVA.idTVA = Article.idTva and Article.idCategorie = Categorie.idCategorie', function (error, results, fields) {
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
        connection.query('SELECT idArticle, libelle, description, prixHT, taux, nomCategorie FROM Article, TVA, Categorie WHERE TVA.idTVA = Article.idTva and Article.idCategorie = Categorie.idCategorie AND idArticle = ?',[req.params.idArticle],function(error, results, fileds){
            if(error){
                throw error;
            }
            return res.json(results);
        })
    })

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

    //ajout d'un compte client
    apiRoutes.post('/client',urlencodedParser,function(req,res){
        console.log(req.body);
        //ajout de l'adresse de facturation
        connection.query('INSERT INTO adresse VALUES (NULL,?,?,?)',[req.body.adresse,req.body.codePostal,req.body.ville],function(error,results,fields){
            if (error){
                throw error;
            } 
        //ajout des informations client avec cle etrangere
        connection.query('INSERT INTO Client VALUES (NULL,?,?,?,?,(SELECT MAX(idAdresse) FROM adresse))',[req.body.nom,req.body.prenom,req.body.email,req.body.numTel],function(error,results,fields){
            if (error){
                throw error;
            } else {
                return res.status(200).json({success:true,message:'Compte client correctement crée'})
            }
        })
        })
    });

    apiRoutes.get('/commande/:idCommande', function (req, res) {
		if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Commande id necessaire'});
        }
        connection.query('SELECT c.*, a.* FROM commande c, adresse a, client cl WHERE a.idAdresse = cl.idAdresse AND c.idClient = cl.idClient AND c.idCommande = ?',[req.params.idCommande], function(error, results, fileds) {
        	if(error){
                throw error;
            }
            return res.json(results);
        })
     });

    //recup des infos pour un client donné en paramètre
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


    //stocker une commande
    apiRoutes.post('/addCmd',bodyPars,function(req,res){
        var id;
        var idCom;
        var sql='SELECT * FROM adresse a WHERE a.adresse = ? and a.codePostal= ? AND a.ville= ?';
        var params=[req.body.adresse,req.body.codePostal,req.body.ville];
        connection.query(sql,params, function (error, results) {
                    if (results.length == 1){
                        id=results[0].idAdresse;
                        console.log('Adresse deja existanta id: '+ id)
                    } else {
                        console.log('Nouvelle adresse');
                        var insertAdresse="INSERT INTO adresse (Adresse,codePostal,ville) VALUES ?";
                        var parametersAdresse=[
                            [req.body.adresse,req.body.codePostal,req.body.ville]
                        ];
                        connection.query(insertAdresse,[parametersAdresse],function(error,resultsAdresse,fields){
                            if (error) {
                                throw error;
                                console.log('Erreur lors de l insertion de l adresse');
                            } else {
                                console.log('Nouvelle adresse inseree');
                                console.log(resultsAdresse);
                                id=resultsAdresse.insertId;
                            }
                            
                        })
                        
                    };

                    var date = new Date();
                    var formatedDate= ""+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                    
                    var insertCommande = "INSERT INTO commande (date,ordre,prixTotalHT,prixTotalTTC,etatCommande,idClient,idAdresse,idTournee,aLivrer) VALUES ?";
                    var parametersCommande = [
                        [formatedDate,0,req.body.prixTotalHT,req.body.prixTotalTTC,'Validée',req.body.idClient,id,null,0]
                    ];

                    connection.query(insertCommande,[parametersCommande],function(error,resultsCommande,fields){
                        if (error){
                            throw error;
                            console.log('Error lors de l insertion de la commande');
                        } else {
                            console.log('Nouvelle commande inseree');
                            idCom=resultsCommande.insertId;
                        }

                        var nbArt = Object.keys(req.body.article).length;
                        var insertLigneCommande = "INSERT INTO lignecommande (idCommande,idArticle,quantite) VALUES ? ";

                        for(var i = 0;i<nbArt;i++){
                            var parametersLigneCommande = [
                                [idCom,req.body.article[i].idArticle,req.body.article[i].qte]
                            ];
                        
	                        connection.query(insertLigneCommande,[parametersLigneCommande],function(error,resultsLigneCommande,fields){
	                            if (error) {
	                                throw error;
	                                console.log('Erreur lors de l insertion de la ligne de commande');
	                            } else {
	                                console.log('Ligne de commande inseree');
	                            }
	                        })
                        }
                    })

                    return res.status(200).json({status: 200, message: "Commande ajoutée"});
				});
        });

        //Liste des commandes faites par un client donné
        apiRoutes.get('/commande/client/:idClient',urlencodedParser,function(req,res){
            if(!req.params.idClient){
                return res.status(400).json({success:false,message:'Client id necessaire'});
            }
            connection.query('select c.idCommande, c.date, c.prixTotalHT, c.prixTotalTTC, c.etatCommande, a.adresse, a.codePostal, a.ville from Commande c, Adresse a where c.idAdresse = a.idAdresse and idClient = ?',[req.params.idClient],function(error,results,fields){
                if (error) {
                    throw error;
                } else {
                    return res.status(200).json(results);
                }
            })
        })

        //Renvoi le contenu d'une commande en fonction du numéro de commande
    apiRoutes.get('/article/commande/:idCommande',function(req,res){
        if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
        connection.query('select a.prixHT, a.libelle, lc.quantite from LigneCommande lc join article a on a.idArticle = lc.idArticle where lc.idCommande = ?',[req.params.idCommande], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    apiRoutes.get('/tournee/:idCient/:idCommande',function(req,res) {
    	if(!req.params.idCient){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
    	if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Commande id necessaire'});
        }
        connection.query('select idTournee from commande where idClient = ? and idCommande = ?', [req.params.idCient, req.params.idCommande], function (error, results, fields) {
        	if (error) {
                throw error;
            }
            return res.json(results);
        });
    });




        
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
app.use(apiRoutes);
}

