import JWT from './JWT.js';
import azMySQLManager from './AzMySQLManager.js';
const secondsInADay = 86400;

/**
 * Stores a JWT token in the cookies.
 * @param {*} token 
 * @param {*} req 
 * @param {*} res 
 */
 function SetJWTCookie (token, req, res) {
    // Store cookie for 6 months
    res.cookie('jwtToken', token, { maxAge: 15552000000, httpOnly: true, sameSite: true, secure: true });
}

// Look for user cookies to see if they are already logged in
export function CookieCheck(req, res, next) {
    // If a cookie is expired it will not show up in req.cookies
    new Promise(async (resolve, reject) => {
        const jwtToken = req.cookies.jwtToken;
        if (!jwtToken) {
            resolve();
            return;
        }
        
        const decoded = JWT.verify(jwtToken);
        if (decoded.err) {
            console.log(`Error with token: ${decoded.err}`); // Probably expired, TokenExpiredError
            res.clearCookie('jwtToken');
            resolve();
            return;
        }
        
        // Check timestamp and refresh token if more than a day old
        if (Date.now() / 1000 - decoded.exp > secondsInADay) {
            // No await so we don't have to wait for the refresh to finish
            RefreshToken(req, res, decoded.email);
        }

        if (!req.user) {
            req.user = {
                email: decoded.email,
            }

            const user_details = await azMySQLManager.getUsernameFromEmail(decoded.email);
            if (user_details) {
                req.user.username = user_details.username;
                req.user.user_id = user_details.user_id;
            }
        }

        resolve();
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        next();
    })
}

async function RefreshToken (req, res, email) {
    // Ensure that they are still whitelisted before refreshing token
    const isWhitelisted = await azMySQLManager.emailIsWhitelisted(email);
    
    if (isWhitelisted) {
        const token = JWT.makeToken(email, '90d');
        SetJWTCookie(token, req, res);
    }
    else {
        // Clear cookie as they are no longer whitelisted, and exit without setting req.user
        res.clearCookie('jwtToken');
    }
}

export function MagicLinkLogin (req, res) {
    // No token
    if (!req.query.token) {
        res.redirect('/');
        return;
    }

    // Verify token provided
    const decoded = JWT.verify(req.query.token);
    if (decoded.err) {
        res.redirect('/'); // Expired potentially
        return;
    }
    
    // TODO: check date in token to see if it is expired

    // Valid JWT token, store in cookies
    // Store cookie for 6 months
    // Temp token, replace with better token
    const expTimeInSeconds = decoded.iat - decoded.exp;
    if (expTimeInSeconds < secondsInADay) {
        RefreshToken(req, res, decoded.email).then(() => {
            res.redirect('/');
        })
    }
}

import SendMagicLinkEmail from './SendMagicLinkEmail.js';

export function TryRegister (req, res) {
    // User is already logged in, do not allow them to login again
    if (req.user) {
        res.status(403).end();
        return;
    }

    if (req.body.email) {
        // TODO: check if email is in db
        // If so, send magic link with token
        azMySQLManager.emailIsWhitelisted(req.body.email).then((result) => {
            if (result == true) {
                const token = JWT.makeToken(req.body.email, '1h');
                SendMagicLinkEmail(req.body.email, token).then(() => {
                
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    }

    res.status(200).end();
}