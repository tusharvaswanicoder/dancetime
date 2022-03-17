import { Middleware } from "../services/Router.mjs";
import Constants from "../services/Constants.mjs";
import { GetUser } from "../services/User.mjs";

export default async function (context, req) {
    context.log('here 1')
    if (await Middleware(context, req, Constants.middleware.CookieCheck)) {
        return; // Middleware returned a value so we should not continue
    }
    
    context.log('here 2')
    // User tries to set username after authenticating with a magic link
    await GetUser(context, req);
    context.log('here 3')
};