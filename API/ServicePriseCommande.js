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
        connection.query('INSERT INTO Client VALUES (NULL,?,?,?,?,(SELECT MAX(idAdresse) FROM adresse))',[req.body.nom,req.body.prenom,req.body.email,req.body.numTel,req.body.motDePasse],function(error,results,fields){
            if (error){
                throw error;
            } else {
                return res.status(200).json({success:true,message:'Compte client correctement crée'})
            }
        })
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
                        var insertAdresse="INSERT INTO adresse (adresse,codePostal,ville) VALUES ?";
                        var parametersAdresse=[
                            [req.body.adresse,req.body.codePostal,req.body.ville]
                        ];
                        connection.query(insertAdresse,[parametersAdresse],function(error,resultsAdresse,fields){
                            if (error) {
                                throw error;
                                console.log('Erreur lors de l insertion de l adresse');
                            } else {
                                console.log('Nouvelle adresse inseree');
                                id=resultsAdresse.insertId;
                            }
                            
                        })
                        
                    };

                    var date = new Date();
                    var formatedDate= ""+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                    
                    var insertCommande = "INSERT INTO commande (date,ordre,prixTotalHT,prixTotalTTC,etatCommande,idClient,idAdresse,idTournee,aLivrer) VALUES ?";
                    var parametersCommande = [
                        [formatedDate,0,req.body.prixTotalHT,req.body.prixTotalTTC,'validation',req.body.idClient,id,1,0]
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
                                console.log('Linge de commande inseree');
                            }
                        })
                        }
                    })


				});
        });
        
    
app.use(apiRoutes);
}

