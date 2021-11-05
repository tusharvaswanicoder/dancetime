const JWT = require('./JWT');
const { AzTableManager } = require('./AzTableManager');

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
function CookieCheck(req, res, next) {
    // If a cookie is expired it will not show up in req.cookies
    new Promise(async (resolve, reject) => {
        const jwtToken = req.cookies.jwtToken;
        if (!jwtToken) {
            resolve();
            return;
        }
        
        const decoded = JWT.verify(jwtToken);
        if (decoded.err) {
            resolve();
            return;
        }
        
        // TODO: check timestamp and refresh token if needed
        if (decoded.exp < Date.now() / 1000) {
            console.log('expired token, refreshing')
            
            // Ensure that they are still whitelisted before refreshing token
            const isWhitelisted = await AzTableManager.emailIsWhitelisted(decoded.email);
            
            if (isWhitelisted) {
                const token = JWT.refreshToken({email: decoded.email});
                SetJWTCookie(token, req, res);
                console.log(`old token: ${jwtToken}`);
                console.log(`new token: ${token}`);
            }
            else {
                // Clear cookie as they are no longer whitelisted, and exit without setting req.user
                res.clearCookie('jwtToken');
                resolve();
                return;
            }
        }
        
        req.user = {
            email: decoded.email
        }
        resolve();
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        next();
    })
}

function MagicLinkLogin (req, res) {
    // No token
    if (!req.query.token) {
        res.redirect('/');
        return;
    }

    // Verify token provided
    const decoded = JWT.verify(req.query.token);
    if (decoded.err) {
        res.redirect('/');
        return;
    }

    // Valid JWT token, store in cookies
    // Store cookie for 6 months
    SetJWTCookie(req.query.token, req, res);

    res.redirect('/');
}

const SendMagicLinkEmail = require('./SendMagicLinkEmail');

function TryRegister (req, res) {
    // User is already logged in, do not allow them to login again
    if (req.user) {
        res.status(403).end();
        return;
    }

    if (req.body.email) {
        // TODO: check if email is in db
        // If so, send magic link with token
        AzTableManager.emailIsWhitelisted(req.body.email).then((result) => {
            if (result == true) {
                const token = JWT.makeToken(req.body.email);
                SendMagicLinkEmail(req.body.email, token).then(() => {
                    
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    }

    res.status(200).end();
}

module.exports = {
    CookieCheck,
    MagicLinkLogin,
    TryRegister
}