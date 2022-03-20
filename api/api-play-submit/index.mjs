import { Middleware } from "../services/Router.mjs";
import Constants from "../services/Constants.mjs";
import { UploadUserPlayScore } from "../services/Play.mjs";

export default async function (context, req) {
    if (await Middleware(context, req, Constants.middleware.CookieCheck, Constants.middleware.UserFullyAuthenticated)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // User finished playing a chart, so verify their play token and submit score if valid
    await UploadUserPlayScore(context, req);
};