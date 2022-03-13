import { request } from 'https';

const MAGIC_LINK_URL = process.env.NODE_ENV == 'production' ? 
    'https://dancetime.io/auth/login' : 'http://localhost:3001/auth/login';

async function SendMagicLinkEmail(email, token) {
    return post(process.env.EMAIL_POST_ENDPOINT, {
        email,
        magiclink: `${MAGIC_LINK_URL}?token=${token}`,
    })
}

function validateEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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
        if (!validateEmail(data.email)) {
            reject();
        }
        
        const req = request(url, options, (res) => {
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

export default SendMagicLinkEmail;
