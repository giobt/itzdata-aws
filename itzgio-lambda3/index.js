'use strict';
const aws = require('aws-sdk');
const mysql = require('mysql');
const config = require('./config.json');

exports.handler = function(event, context, callback) {
    // RDS configuration
    var rds_host = process.env.DbEndpoint;
    var db_username = config.db_username;
    var db_password = config.db_password;
    var db_name = config.db_name;
    var db_port = 3306;
    
    // SQL configuration
    var sql = `SELECT ImageUrl FROM Image`;
    var urls = {};
    
    // Connect to RDS instance
    var con = mysql.createConnection({
        host: rds_host,
        port: db_port,
        user: db_username,
        password: db_password,
        database: db_name
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result[0]));
        urls = {
            url: result[0].ImageId
        };
        console.log(JSON.stringify(urls));
        callback(null, result);
        context.done();
        con.end();
    });
    
    //con.end();
};