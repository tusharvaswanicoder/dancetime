import { IsReviewRecommended } from './AzContentModerator.js';
import azMySQLManager from './AzMySQLManager.js';

/**
 * Returns true if the user is fully signed in with an email, username, and user_id.
 * @param {*} req Request from user
 */
 export const IsUserFullySignedIn = (req) => {
    return typeof req.user != 'undefined' && typeof req.user.username != 'undefined' && typeof req.user.user_id != 'undefined';
}

export function UserFullyAuthenticated (req, res, next) {
    if (IsUserFullySignedIn(req)) {
        next();
    } else {
        res.status(403).end();
    }
}

export function GetUser (req, res, next) {
    if (req.user) {
        res.send(req.user);
    } else {
        return res.status(403).end();
    }
}


function validateUsername(username) {
    const re =/^[a-z0-9]+$/i;
    return re.test(String(username).toLowerCase()) && username.length >= 3;
}

export async function SetUser (req, res, next) {
    if (req.user && req.body && req.body.username) {
        if (req.user.username) {
            res.status(403).end();
            return;
        }

        const username = String(req.body.username).trim();
        if (!validateUsername(username)) {
            res.send({
                error: "Invalid username."
            })
            return;
        }

        if (!process.env.CONTENT_MOD_ENDPOINT || !process.env.CONTENT_MOD_KEY) {
            res.send({
                error: "Failed to check username."
            })
            return;
        }

        // Flagged by content moderator
        if (await IsReviewRecommended(username)) {
            res.send({
                error: "Bad username."
            })
            return;
        }

        const user_result = await azMySQLManager.createNewUser(req.user.email, username);
        req.user = user_result;
        
        res.send({
            user: req.user
        })
    } else {
        return res.status(403).end();
    }
}