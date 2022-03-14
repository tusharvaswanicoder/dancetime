import { Middleware } from "../services/Router.mjs";
import { TryRegister } from "../services/CookieManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req)) {
        return; // Middleware returned a value so we should not continue
    }
    
    // // User is querying an existing chart in db to get its keypoints
    TryRegister(context, req);
};