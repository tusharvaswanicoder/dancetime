const PORT = process.env.PORT || 3001;

import rateLimit from "express-rate-limit";
import express from 'express';
import cookieParser from 'cookie-parser';
import { SetUser, GetUser, UserFullyAuthenticated } from './User.mjs';
import { CookieCheck, MagicLinkLogin, TryRegister } from './CookieManager.mjs';
import chartManager from './ChartManager.mjs';
import chartCategoryManager from './ChartCategoryManager.mjs';
import Constants from "./Constants.mjs";

const MIDDLEWARE_MAP = 
{
    [Constants.middleware.CookieCheck]: CookieCheck,
    [Constants.middleware.UserFullyAuthenticated]: UserFullyAuthenticated
}

function AddContextHelpers (context)
{
    context.res = {status: 200, headers: {}, cookies: []}
    
    context.end = function () {
        this.ended = true;
        return this;
    }
    
    // Add context.cookie() function to set cookies
    context.cookie = function (name, value, options) {
        let existingCookie = this.cookies.find((cookie) => cookie.name == name) || {};
        this.cookies = this.cookies.filter((cookie) => cookie.name != name);
        this.cookies.push({...existingCookie, name, value, ...options});
        return this;
    }
    
    // Add context.redirect() to redirect the user after the request
    context.redirect = function (url) {
        this.res.headers.Location = url;
        this.res.status = 302;
        this.end();
        return this;
    }
    
    context.status = function (status) {
        this.res.status = status;
        return this;
    }
    
    context.send = function (data) {
        this.res.body = data;
    }
}

export function Middleware (context, req, ...args)
{
    AddContextHelpers(context);
    
    try {
        for (let i = 2; i < arguments.length; i++)
        {
            const arg = arguments[i];
            if (MIDDLEWARE_MAP[arg])
            {
                // Call middlware
                MIDDLEWARE_MAP[arg](context, req);
                if (context.ended)
                {
                    return true;
                }
            }
        }
    }
    catch (error)
    {
        console.log(error);
        return {
            body: "An internal server error occurred.",
            status: 500
        }
    }
}



// TODO: fix rate limiters because they probably don't work with az functions
// const apiLimiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     max: 1000
// });

// const createAccountLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hour window
//     max: 10, // start blocking after 10 requests
//     message: "Too many accounts created recently; please try again later"
// });
app.use(express.static('public'));



// Look for user cookies to see if they are already logged in on API or AUTH calls
app.all(["/auth/*", "/api/*"], CookieCheck);

// User is querying an existing chart in db to get its keypoints
app.get('/api/chart/:chart_id/keypoints', apiLimiter, UserFullyAuthenticated, (req, res) => {
    chartManager.getChartKeypoints(req, res);
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
