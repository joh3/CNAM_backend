const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
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

    //Recupère les commandes à valider
    apiRoutes.get('/validCommands',function(req,res){
        var sql = "SELECT cm.idCommande, cm.date,cm.ordre,cm.prixTotalHT,cm.prixTotalTTC,cm.etatCommande,cm.idClient,cm.idAdresse,cm.idTournee,cm.aLivrer,c.nom,c.prenom FROM Commande cm,client c where cm.idClient = c.idClient and etatCommande = 'Validée'"
        connection.query(sql,function(error,results,fields){
            if (error) {
                throw error;
                console.log('Erreur requete SQL');
            } else {
                return res.status(200).json(results);
            }
        })
    })

    //Recupère les commandes à attribuer
    apiRoutes.get('/attrCommands',function(req,res){
        var sql = "SELECT * FROM Commande, Adresse WHERE Commande.idAdresse = Adresse.idAdresse AND etatCommande = 'Attribuée' AND aLivrer = 1"
        connection.query(sql,function(error,results,fields){
            if (error) {
                throw error;
                console.log('Erreur requete SQL');
            } else {
                return res.status(200).json(results);
            }
        })
    })


    //Permet de changer l'état d'une commande grâce a son ID
    apiRoutes.post('/majCommands',bodyPars,function(req,res){
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

    //refuser une commande
    apiRoutes.post('/deleteCommand',bodyPars,function(req,res){
		console.log(req.body);
		connection.query('DELETE FROM LigneCommande WHERE idCommande = ? ',[req.body.idCommande],function(error,results,fields){
            if (error){
                throw error;
            } 
        })
		
        connection.query('DELETE FROM Commande WHERE idCommande = ? ',[req.body.idCommande],function(error,results,fields){
            if (error){
                throw error;
            } else {
                return res.status(200).json({success:true,message:'Commande supprimée'})
            }
        })
    })

    //Renvoi les infos d'un client en fonction du numéro de commande
    apiRoutes.get('/client/AttrCommande/:idCommande',function(req,res){
        if(!req.params.idCommande){
            return res.status(400).json({success:false,message:'Client id necessaire'});
        }
        connection.query('select cli.nom, cli.prenom, a.adresse, a.codePostal, a.ville, cli.numTel from client cli, Adresse a, commande c where c.idClient = cli.idClient and cli.idAdresse = a.idAdresse AND c.idCommande = ? ',[req.params.idCommande], function (error, results, fields) {
            if (error) {
                throw error;
            }
            return res.json(results);
        }); 
    });

    //renvoi la liste des livreurs disponibles
    apiRoutes.get('/livreursDispo',function(req,res){
        var sql = "SELECT idLivreur, nom, prenom, email, statut FROM Livreur WHERE statut='disponible'";
        connection.query(sql,function(error,results,fields){
            if (error) {
                throw error;
            }
            return res.json(results);
        })
    })    

    //creation de la tournee
    apiRoutes.post('/newTournee',bodyPars,function(req,res){
        var sqlTournee = "INSERT INTO Tournee VALUES (NULL,NULL,NULL,?)";
        var idtournee;
        connection.query(sqlTournee,[req.body.idLivreur],function(error,results,fields){
            if(!req.body.idLivreur){
                console.log(req.body)
                console.log('idLivreur missing');
            } else {
                //res.status(200).json({message:'Tournee créee, livreur affecté'});
                console.log('Tournee créee, livreur affecté');
                idtournee = results.insertId;
                
                //boucle sur les commandes
                var nbCommands = Object.keys(req.body.commands).length;
                for(var i=0;i<nbCommands;i++){
                    var sqlCommande = "UPDATE Commande SET etatCommande = 'En cours de livraison', idTournee = " + idtournee + ", ordre = " + i + " WHERE idCommande = ?";
                    console.log(sqlCommande);
                        connection.query(sqlCommande,[req.body.commands[i]],function(error,results,fields){
                    })
                }
                
                //update table livreur
                var sqlLivreur = "UPDATE Livreur SET statut = 'En tournée' WHERE idLivreur = ? ";
                connection.query(sqlLivreur,[req.body.idLivreur],function(error,results,fields){
                    if (error) {
                        throw error;
                    } else {
                        return res.status(200).json({message:'Attribution OK',success:true})
                    }
                })
            }
        })
    })

app.use(apiRoutes);

}


