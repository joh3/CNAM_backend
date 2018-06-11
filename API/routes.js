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

    //Routes pour client
    apiRoutes.route('/').all(function(req,res){
        res.json({message:"Bienvenue sur l'API test",methode:req.method});
    });

    //ajout d'un compte client
    apiRoutes.post('/client',urlencodedParser,function(req,res){
        console.log(req.body);
        //ajout de l'adresse de facturation
        connection.query('INSERT INTO adresseFacturation VALUES (NULL,?,?,?)',[req.body.adresse,req.body.codePostal,req.body.ville],function(error,results,fields){
            if (error){
                throw error;
            } 
        //ajout des informations client avec cle etrangere
        connection.query('INSERT INTO Client VALUES (NULL,?,?,?,?,?,(SELECT MAX(idAdresseFacturation) FROM adressefacturation))',[req.body.nomClient,req.body.prenom,req.body.email,req.body.numTel,req.body.motDePasse],function(error,results,fields){
            if (error){
                throw error;
            } else {
                return res.status(200).json({success:true,message:'Compte client correctement crée'})
            }
        })
        })
    });


    //liste de tous les clients
    apiRoutes.get('/client',function(req,res){
        connection.query('SELECT * from client', function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        });  
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


    apiRoutes.put('/client',urlencodedParser,function(req,res){})
    //fin routes client

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

    //stocker une commande
    apiRoutes.post('/addCmd',bodyPars,function(req,res){
        var id;
        var idCom;
        var sql='SELECT * FROM adresse a WHERE a.adresse = ? and a.codePostal= ? AND a.ville= ?';
        var params=[req.body.adresse,req.body.codePostal,req.body.ville];
        connection.query(sql,params, function (error, results) {
                    if (results.length == 1){
                        id=results[0].idAdresse;
                    }else{
                        var insertAdresse="INSERT INTO `adresse`(adresse,codePostal,ville) VALUES ?";
                        var parametersAdresse=[
                            [req.body.adresse,req.body.codePostal,req.body.ville],
                        ];
                        connection.query(insertAdresse,[parametersAdresse], function (error, results2) {
                            if (error) {
                                return " erreur insertion adresse";
                            }
                            console.log('insertion nouvelle adr');
                            id=results2.insertId;
                        });
                    };
                    var date = new Date();
                    var formatedDate= ""+date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                    var insertCommande="INSERT INTO `commande`(date,ordre,prixTotalHT,prixTotalTTC,etatCommande,idClient,idAdresse,idTournee,aLivrer) VALUES ?";
                    var parametersCommande=[
                            [formatedDate,0,req.body.prixTotalHT,req.body.prixTotalTTC,'validation',req.body.idClient,id,1,0],
                    ];
                    
                    connection.query(insertCommande,[parametersCommande], function (error, results3) {
                            if (error) {
                                return " erreur insertion cmd";
                            }
                            console.log('insertion nouvelle cmd');
                            idCom=results3.insertId;
                            console.log(idCom);
                            
                    var nbArt = Object.keys(req.body.article).length;
                        var insertLigneCommande="INSERT INTO lignecommande`(idCommande`, idArticle, quantite) VALUES ?";

                    for(var i=0;i<nbArt;i++){
                        var parametersLigneCommande=[
                            [idCom,req.body.article[i].idArticle,req.body.article[i].qte],
                            ];
                            
                    connection.query(insertLigneCommande,[parametersLigneCommande], function (error, results4) {
                            if (error) {
                                return " erreur insertion ligneCmd";
                            }
                            console.log('insertion nouvelle ligneCmd');
                        });
                        
                    }
                    });
                });
    });
    

   app.use(apiRoutes);
}


