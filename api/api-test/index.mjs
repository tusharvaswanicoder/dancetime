import { Middleware } from "../services/Router.mjs";
import { MagicLinkLogin } from "../services/CookieManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // got rid of samesite
    context.cookie('testcookie', '5', { maxAge: 15552000, httpOnly: true, secure: true }).end();
};