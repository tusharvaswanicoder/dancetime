const azure = require('azure-storage');
const { v1: uuidv1 } = require('uuid');
const path = require('path');

const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
    
const TABLE_TYPE = {
    CHARTS: 'charts',
    SCORES: 'scores',
    USERS: 'users',
    USER_WHITELIST: 'userwhitelist'
};

const urljoin = require('url-join');
const DL_BASE_URL = process.env.DL_BASE_URL;

class AzTableManager {
    constructor () {
        this.tableService = azure.createTableService(AZURE_STORAGE_CONNECTION_STRING);
    }
    
    emailIsWhitelisted (email) {
        const query = new azure.TableQuery()
            .select('email').where('email eq ?', email).top(1);
        return new Promise((resolve, reject) => {
            this.tableService.queryEntities(TABLE_TYPE.USER_WHITELIST, query, null, {payloadFormat:"application/json;odata=nometadata"}, (err, result, response) => {
                if (err) {
                    reject(err);
                } else {
                    let whitelisted = false;
                    if (response.body.value && response.body.value.length > 0) {
                        whitelisted = response.body.value[0].email == email;
                    }
                    
                    resolve(whitelisted);
                }
            });
        });
    }
}

const azTableManager = new AzTableManager();
module.exports = {
    AzTableManager: azTableManager,
    TABLE_TYPE
}