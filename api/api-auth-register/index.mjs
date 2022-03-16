import { Middleware } from "../services/Router.mjs";
import { TryRegister } from "../services/CookieManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // User goes to site, enters email, and posts request with email to see if they can get a magic link
    await TryRegister(context, req);
};