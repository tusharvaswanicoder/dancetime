import { IsReviewRecommended } from './AzContentModerator.mjs';
import azMySQLManager from './AzMySQLManager.mjs';

/**
 * Returns true if the user is fully signed in with an email, username, and user_id.
 * @param {*} req Request from user
 */
 export const IsUserFullySignedIn = (context) => {
    return typeof context.user != 'undefined' && typeof context.user.username != 'undefined' && typeof context.user.user_id != 'undefined';
}

export async function UserFullyAuthenticated (context, req) {
    context.log(context);
    if (!IsUserFullySignedIn(context)) {
        context.status(403).end();
    }
}

export function GetUser (context, req) {
    if (req.user) {
        context.send(req.user);
    } else {
        return context.status(403).end();
    }
}


function validateUsername(username) {
    const re =/^[a-z0-9]+$/i;
    return re.test(String(username).toLowerCase()) && username.length >= 3;
}

export async function SetUser (context, req) {
    if (req.user && req.body && req.body.username) {
        if (req.user.username) {
            context.status(403).end();
            return;
        }

        const username = String(req.body.username).trim();
        if (!validateUsername(username)) {
            context.send({
                error: "Invalid username."
            })
            return;
        }

        if (!process.env.CONTENT_MOD_ENDPOINT || !process.env.CONTENT_MOD_KEY) {
            context.send({
                error: "Failed to check username."
            })
            return;
        }

        // Flagged by content moderator
        if (await IsReviewRecommended(username)) {
            context.send({
                error: "Bad username."
            })
            return;
        }

        const user_result = await azMySQLManager.createNewUser(req.user.email, username);
        req.user = user_result;
        
        context.send({
            user: req.user
        })
    } else {
        return context.status(403).end();
    }
}