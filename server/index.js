import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;

import rateLimit from "express-rate-limit";

import express from 'express';
import cookieParser from 'cookie-parser';
import { SetUser, GetUser, UserFullyAuthenticated } from './User.js';
import { CookieCheck, MagicLinkLogin, TryRegister } from './CookieManager.js';
import chartManager from './ChartManager.js';
import chartCategoryManager from './ChartCategoryManager.js';

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
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());

app.use(express.static('public'));

// Look for user cookies to see if they are already logged in on API or AUTH calls
app.all(["/auth/*", "/api/*"], CookieCheck);

// User is querying an existing chart in the db
app.get('/api/chart/:id', apiLimiter, UserFullyAuthenticated, (req, res) => {
    // console.log(req.params.id);
    // req.params.id for the :id param
    // res.send({name: 'bob'})
    // get query params: req.query.[param]
    // res.end()
});

// User is querying charts from a certain category
app.get('/api/charts/category/:category', apiLimiter, UserFullyAuthenticated, (req, res, next) => {
    if (req.params.category) {
        req.params.category = req.params.category.toLowerCase();
    }
    
    chartCategoryManager.userRequestChartsInCategory(req, res);
});

// User is publishing a chart
app.post('/api/chart/publish', apiLimiter, UserFullyAuthenticated, (req, res, next) => {
    chartManager.publishChart(req, res);
});

// User arrives here with a magic link
app.get('/auth/login', createAccountLimiter, MagicLinkLogin);

// User goes to site, enters email, and posts request with email to see if they can get a magic link
app.post('/auth/register', createAccountLimiter, TryRegister);

// User tries to set username after authenticating with  magic link
app.post('/api/user/set', apiLimiter, SetUser);

// User queries this on page load to get their info and load the authenticated screen(s)
app.get('/api/user/get', apiLimiter, GetUser);

app.get('*', (req, res) => {
    res.redirect('/');
    res.end();
});

app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
