import { createConnection, createPool } from 'promise-mysql';
import { default_tables } from './DatabaseConfig.mjs';
import snappy from 'snappy';
import { sleep } from './utils.mjs';

const DATABASE_NAME = process.env.NODE_ENV == 'production' ?
    process.env.MYSQL_DB_PROD : process.env.MYSQL_DB_DEV;
    
class AzMySQLManager {
    constructor () {
        this.conn = null;
        this.pool = null;

        this.initialized = false;
        this.initialize();
    }

    async initialize () {
        try {
            await this.initializeConnectionAndTables();
        } catch (error) {
            console.error(error);
        }
    }
    
    async submitChartScoreForUser (chart_id, user_id, score, judgements, chart_version) {
        await this.waitForInitialized();
        const now = new Date();
        const timestamp = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}`;
        
        try {
            const result = await this.pool.query('INSERT INTO chart_scores (timestamp, chart_id, user_id, score, judgements, version) VALUES (?, ?, ?, ?, ?, ?)', 
                [timestamp, chart_id, user_id, score, judgements, chart_version]);
            return {insertId: result.insertId};
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async tryGetPublishedChartDetails (chart_id) {
        await this.waitForInitialized();
        
        const result = await this.pool.query('SELECT chart_id, title, song_artist, choreography, difficulty, last_edited, video_link, video_id, duration, visibility, version, tags, user_id FROM charts WHERE chart_id = ? LIMIT 1', [chart_id]);
        if (result[0]) {
            return result[0];
        }
    }

    async tryGetPublishedChartDuration (chart_id) {
        await this.waitForInitialized();
        
        const result = await this.pool.query('SELECT duration FROM charts WHERE chart_id = ? LIMIT 1', [chart_id]);
        if (result[0]) {
            return result[0].duration;
        }
    }

    async tryGetPublishedChartKeypoints (chart_id) {
        await this.waitForInitialized();
        
        const result = await this.pool.query('SELECT keypoints FROM charts WHERE chart_id = ? LIMIT 1', [chart_id]);
        if (result[0]) {
            return this.compressedStringToJSON(result[0].keypoints);
        }
    }

    async createNewUser (email, username) {
        await this.waitForInitialized();
        
        try {
            const result = await this.pool.query('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);
            return {email, username, user_id: result.insertId};
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async getUsernameFromEmail (email) {
        await this.waitForInitialized();
        
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
            return result[0];
        } catch (error) {
            console.error(error);
            return;
        }
    }

    jsonToCompressedString (json) {
        return snappy.compressSync(JSON.stringify(json));
    }

    compressedStringToJSON (str) {
        return JSON.parse(snappy.uncompressSync(str));
    }

    /**
     * Called when a user presses the "SAVE" button to save their chart or when a new project is created.
     * @param {*} chart 
     * @param {*} user 
     * @returns Updated chart information to reuturn to the user, or undefined if it failed.
     */
     async saveChart (chart, user) {
        await this.waitForInitialized();
        
        try {
            let existing_chart = null;
            if (chart.chart_id) {
                const result = await this.pool.query('SELECT * FROM projects WHERE project_id = ? AND user_id = ? LIMIT 1', [chart.project_id, user.user_id]);
                existing_chart = result[0];
            }

            if (!existing_chart) {
                // Chart has never been saved before
                chart.version = 1;
                chart.user_id = user.id;
                const query = `INSERT INTO projects (title, song_artist, choreography, difficulty, last_edited, video_link, video_id, duration, visibility, version, tags, components, keypoints, user_id, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                await this.pool.query(query, [chart.title, chart.song_artist, chart.choreography, chart.difficulty, new Date(), chart.video_link, chart.video_id, chart.duration, chart.visibility, chart.version, this.jsonToCompressedString(chart.tags), this.jsonToCompressedString(chart.components), this.jsonToCompressedString(chart.keypoints), user.user_id, chart.project_id]);
            } else {
                // Chart has been saved once already, so update it
                existing_chart.version++;
                const query = `UPDATE projects SET title = ?, song_artist = ?, choreography = ?, difficulty = ?, last_edited = ?, visibility = ?, version = ?, tags = ?, components = ?, keypoints = ?, chart_id = ? WHERE project_id = ? AND user_id = ?`;
                await this.pool.query(query, [chart.title, chart.song_artist, chart.choreography, chart.difficulty, new Date(), chart.visibility, existing_chart.version, this.jsonToCompressedString(chart.tags), this.jsonToCompressedString(chart.components), this.jsonToCompressedString(chart.keypoints), existing_chart.chart_id || null, existing_chart.project_id, user.user_id]);
            }

            // Query again to get latest version of the chart
            const result = await this.pool.query('SELECT * FROM charts WHERE chart_id = ? AND user_id = ? LIMIT 1', [chart.chart_id, user.user_id]);
            chart = result[0];

            // Delete extra info not needed to send back
            delete chart.tags;
            delete chart.components;
            delete chart.keypoints;
            chart = JSON.parse(JSON.stringify(chart));

            // Return chart info with updated version and user_id
            return chart;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    /**
     * Called when a user presses the "PUBLISH" button to publish their chart (new or updated version).
     * @param {*} chart 
     * @param {*} user 
     * @returns Updated chart information to reuturn to the user, or undefined if it failed.
     */
    async publishChart (chart, user) {
        await this.waitForInitialized();
        
        try {
            let existing_chart = null;
            if (chart.chart_id) {
                const result = await this.pool.query('SELECT * FROM charts WHERE chart_id = ? AND user_id = ? LIMIT 1', [chart.chart_id, user.user_id]);
                existing_chart = result[0];
            }

            if (!existing_chart) {
                // Chart has never been published before
                chart.version = 1;
                chart.user_id = user.id;
                const query = `INSERT INTO charts (title, song_artist, choreography, difficulty, last_edited, video_link, video_id, duration, visibility, version, tags, components, keypoints, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const result = await this.pool.query(query, [chart.title, chart.song_artist, chart.choreography, chart.difficulty, new Date(), chart.video_link, chart.video_id, chart.duration, chart.visibility, chart.version, this.jsonToCompressedString(chart.tags), this.jsonToCompressedString(chart.components), this.jsonToCompressedString(chart.keypoints), user.user_id]);
                chart.chart_id = result.insertId;
            } else {
                // Chart has been published, so just update it
                existing_chart.version++;
                const query = `UPDATE charts SET title = ?, song_artist = ?, choreography = ?, difficulty = ?, last_edited = ?, visibility = ?, version = ?, tags = ?, components = ?, keypoints = ? WHERE chart_id = ? AND user_id = ?`;
                await this.pool.query(query, [chart.title, chart.song_artist, chart.choreography, chart.difficulty, new Date(), chart.visibility, existing_chart.version, this.jsonToCompressedString(chart.tags), this.jsonToCompressedString(chart.components), this.jsonToCompressedString(chart.keypoints), existing_chart.chart_id, user.user_id]);
            }

            // Query again to get latest version of the chart
            const result = await this.pool.query('SELECT * FROM charts WHERE chart_id = ? AND user_id = ? LIMIT 1', [chart.chart_id, user.user_id]);
            chart = result[0];

            // Delete extra info not needed to send back
            delete chart.tags;
            delete chart.components;
            delete chart.keypoints;
            chart = JSON.parse(JSON.stringify(chart));

            // Return chart info with updated version and user_id
            return chart;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    /**
     * Check if an email is whitelisted/invited.
     * @param {*} email Email to check
     * @returns True/false if the email is invited.
     */
    async emailIsWhitelisted (email) {
        await this.waitForInitialized();
        
        const result = await this.pool.query('SELECT * FROM invited_emails WHERE email = ? LIMIT 1', [email]);
        if (result[0]) {
            return result[0].email == email;
        } else {
            return false;
        }
    }
    
    async waitForInitialized() {
        while (!this.initialized) {
            await sleep(100);
        }
    }

    /**
     * Creates a connection to the databse, ensures database exists,
     * and then creates default tables from DatabaseConfig.js if they
     * do not exist.
     */
    async initializeConnectionAndTables () {
        this.conn = await createConnection({ 
            host: process.env.MYSQL_DB_HOST, 
            user: process.env.MYSQL_DB_USER, 
            password: process.env.MYSQL_DB_PW, 
            // database: DATABASE_NAME, 
            port: process.env.MYSQL_DB_PORT,
            ssl: true
        });

        await this.conn.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);

        this.pool = await createPool({
            connectionLimit : 100,
            host     : process.env.MYSQL_DB_HOST,
            user     : process.env.MYSQL_DB_USER,
            password : process.env.MYSQL_DB_PW,
            database : DATABASE_NAME,
            debug    : process.env.DEBUG == 'TRUE',
            ssl: true,
            reconnect: true,
            connectTimeout  : 60 * 60 * 1000,
            acquireTimeout  : 60 * 60 * 1000,
            timeout         : 60 * 60 * 1000,
        });

        for (const table_config of default_tables) {
            // Remove extra spaces and newlines from table structure
            const escaped_structure = table_config.structure.replace(/\n/g, '').replace(/ +(?= )/g,'');
            await this.pool.query(`CREATE TABLE IF NOT EXISTS ${table_config.name} ${escaped_structure}`);
        }

        this.initialized = true;
        console.log(`MySQL initialized!`);
    }
}

const azMySQLManager = new AzMySQLManager();
export default azMySQLManager;