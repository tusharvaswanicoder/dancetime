import { Middleware } from "../services/Router.mjs";
import { MagicLinkLogin } from "../services/CookieManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req)) {
        return; // Middleware returned a value so we should not continue
    }
    
    context.cookie('testcookie', '5', { maxAge: 15552000, httpOnly: true, domain: "dancetime.io",  sameSite: 'Strict', secure: false }).end();
};