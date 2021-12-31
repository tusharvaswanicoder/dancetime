import { IsReviewRecommended } from './AzContentModerator.js';
import azMySQLManager from './AzMySQLManager.js';

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