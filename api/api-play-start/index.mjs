import { Middleware } from "../services/Router.mjs";
import Constants from "../services/Constants.mjs";
import { SendUserPlayToken } from "../services/Play.mjs";

export default async function (context, req) {
    if (await Middleware(context, req, Constants.middleware.CookieCheck, Constants.middleware.UserFullyAuthenticated)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // User starts playing a chart, so return a unique play token (for uploading scores)
    await SendUserPlayToken(context, req);
};