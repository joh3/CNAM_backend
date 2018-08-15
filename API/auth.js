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

    apiRoutes.post('/login',urlencodedParser,function(req,res){
        console.log(req.body)
        var sql="SELECT u.login, u.password, u.idRole FROM Utilisateur u WHERE login = ? AND password = ?"
        connection.query(sql,[req.body.login,req.body.password],function(error,results,fields){
            if(results.length == 0){
                return res.status(400).json({message:'essaye encore',success:false});
            } else {
                return res.status(200).json({message:'tu es connecté mon khey',success:true,role:results[0].idRole});
            }
        })
    })

    app.use(apiRoutes);

}