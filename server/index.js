import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;

import rateLimit from "express-rate-limit";

import express from 'express';
import cookieParser from 'cookie-parser';
import { SetUser, GetUser } from './User.js';
import { CookieCheck, MagicLinkLogin, TryRegister } from './CookieManager.js';

function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.end();
    }
}

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000
});

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // start blocking after 10 requests
    message:
      "Too many accounts created from this IP, please try again after an hour"
});

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

// Look for user cookies to see if they are already logged in on API or AUTH calls
app.all(["/auth/*", "/api/*"], CookieCheck);

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

// User arrives here with a magic link
app.get('/auth/login', createAccountLimiter, MagicLinkLogin);

// User goes to site, enters email, and posts request with email to see if they can get a magic link
app.post('/auth/register', createAccountLimiter, TryRegister);

// User goes to site, enters email, and posts request with email to see if they can get a magic link
app.post('/api/user/set', apiLimiter, SetUser);

// User queries this on page load to get their info and load the authenticated screen(s)
app.get('/api/user/get', apiLimiter, GetUser);

app.get('*', (req, res) => {
    res.redirect('/');
    res.end();
});

app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
