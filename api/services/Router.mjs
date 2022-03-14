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
        let existingCookie = this.res.cookies.find((cookie) => cookie.name == name) || {};
        this.res.cookies = this.res.cookies.filter((cookie) => cookie.name != name);
        this.res.cookies.push({...existingCookie, name, value, ...options});
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

export async function Middleware (context, req, ...args)
{
    return new Promise(async (resolve, reject) => {
        AddContextHelpers(context);
        
        try {
            for (let i = 2; i < arguments.length; i++)
            {
                const arg = arguments[i];
                context.log(`Executing middleware ${arg}`)
                if (MIDDLEWARE_MAP[arg])
                {
                    // Call middlware
                    await MIDDLEWARE_MAP[arg](context, req);
                    if (context.ended)
                    {
                        context.log(`Ending middlware on ${arg}`);
                        return resolve(true);
                    }
                }
            }
        }
        catch (error)
        {
            console.log(error);
            context.status(500).end();
        }
        
        resolve();
    })
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
// app.use(express.static('public'));



// // Look for user cookies to see if they are already logged in on API or AUTH calls
// app.all(["/auth/*", "/api/*"], CookieCheck);

// // User is querying an existing chart in db to get its keypoints
// app.get('/api/chart/:chart_id/keypoints', apiLimiter, UserFullyAuthenticated, (req, res) => {
//     chartManager.getChartKeypoints(req, res);
// });

// // User is querying charts from a certain category
// app.get('/api/charts/category/:category', apiLimiter, UserFullyAuthenticated, (req, res, next) => {
//     if (req.params.category) {
//         req.params.category = req.params.category.toLowerCase();
//     }
    
//     chartCategoryManager.userRequestChartsInCategory(req, res);
// });

// // User is publishing a chart
// app.post('/api/chart/publish', apiLimiter, UserFullyAuthenticated, (req, res, next) => {
//     chartManager.publishChart(req, res);
// });

// // User arrives here with a magic link
// app.get('/auth/login', createAccountLimiter, MagicLinkLogin);

// // User goes to site, enters email, and posts request with email to see if they can get a magic link
// app.post('/auth/register', createAccountLimiter, TryRegister);

// // User tries to set username after authenticating with  magic link
// app.post('/api/user/set', apiLimiter, SetUser);

// // User queries this on page load to get their info and load the authenticated screen(s)
// app.get('/api/user/get', apiLimiter, GetUser);

// app.get('*', (req, res) => {
//     res.redirect('/');
//     res.end();
// });
