'use strict';
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const mysql = require('mysql');
const config = require('./config.json');

exports.handler = function(event, context, callback) {
    // RDS configuration
    var rds_host = process.env.DbEndpoint;
    var db_username = config.db_username;
    var db_password = config.db_password;
    var db_name = config.db_name;
    var db_port = 3306;
    
    // Get the object from the event and show its content type
    var bucket = event.Records[0].s3.bucket.name;
    var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    var params = {
        Bucket: bucket,
        Key: key,
    };
    
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            // Get tag name and value
            var tagName = Object.keys(data.Metadata)[0];
            var tagValue = data.Metadata[tagName];
            var imageUrl = `https://s3-us-west-2.amazonaws.com/${bucket}/${key}`;
            
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
            
            var sql = `INSERT INTO Image (Name, TagName, TagValue, ImageUrl) VALUES ('${key}', '${tagName}', '${tagValue}', '${imageUrl}')`;
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
            
            con.end(); 
            
            callback(null, 'Success');
        }
    });
};