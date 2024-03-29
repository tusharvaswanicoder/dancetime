import JWT from './JWT.mjs';
import azMySQLManager from './AzMySQLManager.mjs';
const secondsInADay = 86400;

/**
 * Stores a JWT token in the cookies.
 * @param {*} token 
 * @param {*} req 
 * @param {*} res 
 */
 function SetJWTCookie (token, context, req) {
    // Store cookie for 6 months
    context.cookie('jwtToken', token, { maxAge: 15552000, httpOnly: true, secure: true });
}

export const ParseCookies = (req) => {
        // Return an empty object if cookieString is empty
        try {
            const cookies = req.headers.cookie || "";
            if (cookies === "")
            {
                return {};
            }
    
            // Get each individual key-value pairs
            // from the cookie string
            // This returns a new array
            let pairs = cookies.split(";");
    
            // Separate keys from values in each pair string
            // Returns a new array which looks like
            // [[key1,value1], [key2,value2], ...]
            let splittedPairs = pairs.map(cookie => cookie.split("="));
    
            // Create an object with all key-value pairs
            const cookieObj = splittedPairs.reduce(function (obj, cookie) {
    
                // cookie[0] is the key of cookie
                // cookie[1] is the value of the cookie
                // decodeURIComponent() decodes the cookie
                // string, to handle cookies with special
                // characters, e.g. '$'.
                // string.trim() trims the blank spaces
                // auround the key and value.
                obj[decodeURIComponent(cookie[0]?.trim())] = decodeURIComponent(cookie[1]?.trim());
                return obj;
            }, {})
    
            return cookieObj;
        } catch (err) {
            console.log(err);
            return {};
        }
}

// Look for user cookies to see if they are already logged in
export async function CookieCheck(context, req) {
    // req.headers.cookie: 'Cookie_1=value'
    // If a cookie is expired it will not show up in cookies
    req.cookies = ParseCookies(req);
    return new Promise(async (resolve, reject) => {
        const jwtToken = req.cookies.jwtToken;
        if (!jwtToken) {
            resolve();
            return;
        }
        
        const decoded = JWT.verify(jwtToken);
        if (decoded.err) {
            // context.log(`Error with token: ${decoded.err}`); // Probably expired, TokenExpiredError
            context.cookie('jwtToken', '', { maxAge: 1, httpOnly: true, secure: true }).end();
            resolve();
            return;
        }
        
        // Check timestamp and refresh token if more than a day old
        if (Date.now() / 1000 - decoded.exp > secondsInADay) {
            await RefreshToken(context, req, decoded.email);
        }

        if (!context.user) {
            context.user = {
                email: decoded.email,
            }

            const user_details = await azMySQLManager.getUsernameFromEmail(decoded.email);
            if (user_details) {
                context.user.username = user_details.username;
                context.user.user_id = user_details.user_id;
            }
        }

        resolve();
    }).catch((err) => {
        context.log(err);
    })
}

async function RefreshToken (context, req, email) {
    // Ensure that they are still whitelisted before refreshing token
    const isWhitelisted = await azMySQLManager.emailIsWhitelisted(email);
    
    if (isWhitelisted) {
        const token = JWT.makeToken(email, '90d');
        SetJWTCookie(token, context, req);
    }
    else {
        // Clear cookie as they are no longer whitelisted, and exit without setting context.user
        context.cookie('jwtToken', '', { maxAge: 1, httpOnly: true, secure: true });
    }
}

export async function MagicLinkLogin (context, req) {
    return new Promise((resolve, reject) => {
        // No token
        if (!req.query.token) {
            context.redirect('/');
            return resolve();
        }

        // Verify token provided
        const decoded = JWT.verify(req.query.token);
        if (decoded.err) { // Expired potentially
            context.redirect('/');
            return resolve();
        }
        
        // TODO: check date in token to see if it is expired

        // Valid JWT token, store in cookies
        // Store cookie for 6 months
        // Temp token, replace with better token
        const expTimeInSeconds = decoded.iat - decoded.exp;
        if (expTimeInSeconds < secondsInADay) {
            RefreshToken(context, req, decoded.email).then(() => {
                context.redirect('/');
                resolve();
            })
        } else {
            context.redirect('/');
            resolve();
        }
    })
}

import SendMagicLinkEmail from './SendMagicLinkEmail.mjs';

export function TryRegister (context, req) {
    return new Promise((resolve, reject) => {
        // User is already logged in, do not allow them to login again
        if (context.user) {
            context.status(403).end();
            return resolve();
        }

        if (req.body.email) {
            azMySQLManager.emailIsWhitelisted(req.body.email).then((result) => {
                if (result == true) {
                    const token = JWT.makeToken(req.body.email, '3h');
                    SendMagicLinkEmail(req.body.email, token).then(() => {
                    
                    }).catch((err) => {
                        context.log(err);
                    }).finally(() => {
                        context.status(200).end();
                        resolve();
                    })
                } else {
                    context.status(200).end();
                    resolve();
                }
            });
        } else {
            resolve();
            context.status(200).end();
        }
    })
}