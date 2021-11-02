// https://dev.to/flippedcoding/implementing-passwordless-authentication-in-node-js-43m0
// https://erikmartinjordan.com/use-nodemailer-gmail-alias-account

const PORT = process.env.PORT || 3001;
require('dotenv').config();

const { EnsurePythonIsInstalledLinux } = require('./PythonManager');
EnsurePythonIsInstalledLinux();
const rateLimit = require("express-rate-limit");

const express = require('express');
const cookieParser = require('cookie-parser');
const { YTDL, YTDL_STATE } = require('./YouTubeDL');
YTDL.init();

const path = require('path');

const { azBlobManager } = require('./AzBlobManager');
const { mediaManager } = require('./MediaManager');

function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.end();
    }
}

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100
});

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message:
      "Too many accounts created from this IP, please try again after an hour"
});

const JWT = require('./JWT');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Look for user cookies to see if they are already logged in
app.use((req, res, next) => {
    const jwtToken = req.cookies.jwtToken;
    if (jwtToken) {
        const decoded = JWT.verify(jwtToken);
        if (!decoded.err) {
            req.user = {
                email: decoded.email
            }
            
            // TODO: check timestamp and refresh token if needed
        }
    }
    next();
})

app.use(express.static('public'));

const { AzTableManager } = require('./AzTableManager');

const SendMagicLinkEmail = require('./SendMagicLinkEmail');

// TODO: check if authenticated before allowing access to the endpoint

// User is querying an existing chart in the db
app.get('/api/chart/:id', apiLimiter, isAuthenticated, (req, res) => {
    // console.log(req.params.id);
    // req.params.id for the :id param
    // res.send({name: 'bob'})
    // get query params: req.query.[param]
    // res.end()
});

// User is creating a new chart - create a new chart in db, download video, etc
app.post('/api/chart/new', apiLimiter, isAuthenticated, (req, res) => {
    // console.log(req.params.id);
    // req.params.id for the :id param
    // res.send({name: 'bob'})
    // get query params: req.query.[param]
    // res.end()
});

// id is a uuid
app.get('/api/video/:id', apiLimiter, isAuthenticated, (req, res) => {
    // See what the current download status of a video is.
    // If it does not exist, begin downloading and return status.
    mediaManager.getMedia(req.params.id).then((media_info) => {
        res.send(media_info);
        res.end();
    });
});

// User arrives here with a magic link
app.get('/login', createAccountLimiter, (req, res) => {
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
    // res.cookie('jwtToken', req.query.token, { maxAge: 900000, httpOnly: true, secure: true, sameSite: true });
    res.cookie('jwtToken', req.query.token, { maxAge: 900000, httpOnly: true, sameSite: true });

    res.redirect('/');
});

// User goes to site, enters email, and posts request with email to see if they can get a magic link
app.post('/register', createAccountLimiter, (req, res) => {
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
});

// User queries this on page load to get their info and load the authenticated screen(s)
app.get('/getMyInfo', (req, res) => {
    if (req.user) {
        // TODO: query from DB or something for more detailed info
        res.send(req.user);
    } else {
        return res.status(403).end();
    }
});

app.get('*', (req, res) => {
    if (req.user) {
        res.send(req.user);
    }
    res.end();
});
 
// https://github.com/benank/ecs-162-assignment4/blob/main/index.js

app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
