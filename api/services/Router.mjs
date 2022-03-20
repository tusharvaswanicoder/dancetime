import { UserFullyAuthenticated } from './User.mjs';
import { CookieCheck } from './CookieManager.mjs';
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
                // context.log(`Executing middleware ${arg}`)
                if (MIDDLEWARE_MAP[arg])
                {
                    // Call middlware
                    await MIDDLEWARE_MAP[arg](context, req);
                    if (context.ended)
                    {
                        // context.log(`Ending middlware on ${arg}`);
                        return resolve(true);
                    }
                }
            }
        }
        catch (error)
        {
            context.log(error);
            context.status(500).end();
        }
        
        resolve();
    })
}