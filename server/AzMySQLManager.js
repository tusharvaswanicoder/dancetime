const mysql = require('promise-mysql');
const dotenv = require('dotenv');
dotenv.config();

const db_config = require('./DatabaseConfig');

const DATABASE_NAME = process.env.NODE_ENV == 'production' ?
    process.env.MYSQL_DB_PROD : process.env.MYSQL_DB_DEV;

class AzMySQLManager {
    constructor () {
        this.conn = null;
        this.pool = null;

        this.initialized = false;
        try {
            this.initializeConnectionAndTables();
        } catch (error) {
            console.error(error);
        }
    }

    emailIsWhitelisted (email) {
        return new Promise(async (resolve, reject) => {
            const result = await this.pool.query('SELECT * FROM invited_emails WHERE email = ? LIMIT 1', [email]);

            if (result[0]) {
                resolve(result[0].email == email);
            } else {
                resolve(false);
            }
        })
    }

    /**
     * Creates a connection to the databse, ensures database exists,
     * and then creates default tables from DatabaseConfig.js if they
     * do not exist.
     */
    async initializeConnectionAndTables () {
        this.conn = await mysql.createConnection({ 
            host: process.env.MYSQL_DB_HOST, 
            user: process.env.MYSQL_DB_USER, 
            password: process.env.MYSQL_DB_PW, 
            // database: DATABASE_NAME, 
            port: process.env.MYSQL_DB_PORT,
            ssl: true
        });

        await this.conn.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);

        this.pool = await mysql.createPool({
            connectionLimit : 100,
            host     : process.env.MYSQL_DB_HOST,
            user     : process.env.MYSQL_DB_USER,
            password : process.env.MYSQL_DB_PW,
            database : DATABASE_NAME,
            debug    : process.env.DEBUG == 'TRUE',
            ssl: true
        });

        for (const table_config of db_config.default_tables) {
            // Remove extra spaces and newlines from table structure
            const escaped_structure = table_config.structure.replaceAll('\n', '').replace(/ +(?= )/g,'');
            await this.pool.query(`CREATE TABLE IF NOT EXISTS ${table_config.name} ${escaped_structure}`);
        }

        this.initialized = true;
        console.log(`MySQL initialized!`);
    }
}

const azMySQLManager = new AzMySQLManager();
module.exports = azMySQLManager;