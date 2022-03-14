import { Middleware } from "../services/Router.mjs";
import Constants from "../services/Constants.mjs";
import chartCategoryManager from "../services/ChartCategoryManager.mjs";

export default async function (context, req) {
    if (await Middleware(context, req, Constants.middleware.CookieCheck, Constants.middleware.UserFullyAuthenticated)) {
        return; // Middleware returned a value so we should not continue
    }
    
    if (req.params.category) {
        req.params.category = req.params.category.toLowerCase();
    }
    
    // // User is querying an existing chart in db to get its keypoints
    await chartCategoryManager.userRequestChartsInCategory(context, req);
};