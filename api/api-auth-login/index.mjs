import { Middleware } from "../services/Router.mjs";
import { MagicLinkLogin } from "../services/CookieManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // User arrives here with a magic link
    await MagicLinkLogin(context, req);
    context.log(context);
    context.log(context.res.cookies);
};