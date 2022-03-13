import { Middleware } from "../services/Router.mjs";
import Constants from "../services/Constants.mjs";

export default async function (context, req) {
    if (Middleware(context, req, Constants.middleware.CookieCheck, Constants.middleware.UserFullyAuthenticated)) {
        return; // Middleware returned a value so we should not continue
    }
    
    
};