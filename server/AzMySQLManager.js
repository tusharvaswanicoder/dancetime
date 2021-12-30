const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const DATABASE_NAME = process.env.NODE_ENV == 'production' ?
    process.env.MYSQL_DB_PROD : process.env.MYSQL_DB_DEV;

const conn = mysql.createConnection({ 
    host: process.env.MYSQL_DB_HOST, 
    user: process.env.MYSQL_DB_USER, 
    password: process.env.MYSQL_DB_PW, 
    database: DATABASE_NAME, 
    port: process.env.MYSQL_DB_PORT,
    ssl: {ca: fs.readFileSync(path.join(__dirname, `/ssl/${process.env.MYSQL_DB_SSL_CERT}.crt.pem`))}
})

conn.connect(
    function (err) { 
    if (err) { 
        console.log("!!! Cannot connect !!! Error:");
        throw err;
    }
    else
    {
       console.log("Connection established.");
        //    queryDatabase();
    }
});