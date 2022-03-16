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
    if (!IsUserFullySignedIn(context)) {
        context.status(403).end();
    }
}

export function GetUser (context, req) {
    return new Promise(async (resolve, reject) => {
        if (context.user) {
            context.log('got user')
            context.send(context.user);
        } else {
            context.log('no user')
            context.status(403).end();
        }
        resolve();
    })
}


function validateUsername(username) {
    const re =/^[a-z0-9]+$/i;
    return re.test(String(username).toLowerCase()) && username.length >= 3;
}

export async function SetUser (context, req) {
    return new Promise(async (resolve, reject) => {
        if (context.user && req.body && req.body.username) {
            if (context.user.username) {
                context.status(403).end();
                return resolve();
            }

            const username = String(req.body.username).trim();
            if (!validateUsername(username)) {
                context.send({
                    error: "Invalid username."
                })
                return resolve();
            }

            if (!process.env.CONTENT_MOD_ENDPOINT || !process.env.CONTENT_MOD_KEY) {
                context.send({
                    error: "Failed to check username."
                })
                return resolve();
            }

            // Flagged by content moderator
            if (await IsReviewRecommended(username)) {
                context.send({
                    error: "Bad username."
                })
                return resolve();
            }

            const user_result = await azMySQLManager.createNewUser(context.user.email, username);
            if (user_result) {
                context.user = user_result;
                
                context.send({
                    user: context.user
                })
            }
            
            resolve();
        } else {
            context.status(403).end();
            resolve();
        }
    })
}