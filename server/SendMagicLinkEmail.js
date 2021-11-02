const https = require('https');
const path = require('path');

const MAGIC_LINK_URL = process.env.NODE_ENV == 'production' ? 
    process.env.MAGIC_LINK_URL : 'http://localhost:3001/login';

async function SendMagicLinkEmail(email, token) {
    return post(process.env.EMAIL_POST_ENDPOINT, {
        email,
        magiclink: `${MAGIC_LINK_URL}?token=${token}`,
    })
}

async function post(url, data) {
    const dataString = JSON.stringify(data);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
        },
        timeout: 1000, // in ms
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                return reject(new Error(`HTTP status code ${res.statusCode}`));
            }

            const body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                const resString = Buffer.concat(body).toString();
                resolve(resString);
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request time out'));
        });

        req.write(dataString);
        req.end();
    });
}

module.exports = SendMagicLinkEmail;
