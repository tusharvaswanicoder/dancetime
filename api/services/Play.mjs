import azMySQLManager from './AzMySQLManager.mjs';
import jwt from 'jsonwebtoken';

// How much extra time they are given from the time the token is created to submit their score
const EXPIRE_TIME_LEEWAY = 60;

const VerifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_PLAY_SECRET_KEY);
    } catch (err) {
        return {err};
    }
}

const MakeNewToken = (args, exp_time) => {
    return jwt.sign(
        { ...args },
        process.env.JWT_PLAY_SECRET_KEY, 
        { expiresIn: `${exp_time}s`, algorithm: 'HS256'});
}

export const UploadUserPlayScore = (context, req) => {
    return new Promise(async (resolve, reject) => {
        const user_id = context.user.user_id;
        const chart_id = req.params.chart_id;
        
        if (!user_id || !chart_id || !req.body.score) 
        {
            context.status(403).end();
            return resolve();
        }
        
        const score = parseFloat(req.body.score);
        if (score < 0 || score > 100) 
        {
            context.log(`WARNING: USER ${user_id} ATTEMPTED TO UPLOAD INVALID SCORE OF ${score}`)
            context.status(403).end();
            return resolve();
        }
        
        const judgements = req.body.j;
        if (!judgements) 
        {
            context.status(403).end();
            return resolve();
        }
        
        // Verify play token
        const token = req.cookies.playToken;
        if (!token)
        {
            context.status(403).end();
            return resolve();
        }
        
        if (!VerifyToken(token))
        {
            context.status(403).end();
            return resolve();
        }
        
        const decoded_token = jwt.decode(token);
        // { uid: 10, cid: '5', d: 204.14, iat: 1647731565, exp: 1647731830 }
        if (decoded_token.uid != user_id || decoded_token.cid != chart_id)
        {
            context.status(403).end();
            return resolve();
        }
        
        // Check if expired or if not within the submit time window
        const now = new Date();
        const chart_start_time = new Date(decoded_token.iat);
        const chart_exp_time = new Date(decoded_token.exp);
        // If expired
        if (now.getTime() < chart_exp_time.getTime()) {
            context.status(403).end();
            return resolve();
        }
        
        // If song duration has not elapsed yet - possibly a hacker TODO: add to possibly evil people list
        // TODO: update this with only the time from start to end using components (possibly update SQL db for charts or use components)
        // if (chart_start_time.getTime() + decoded_token.d * 1000 > now.getTime()) {
        //     const delta = chart_start_time.getTime() + decoded_token.d * 1000 - now.getTime();
        //     context.warn(`POSSIBLE HACKER ON SCORE SUBMIT: user_id: ${user_id} chart_id: ${chart_id} score: ${score} delta_ms: ${delta}`)
        //     context.status(403).end();
        //     return resolve();
        // }
        
        const chart_details = await azMySQLManager.tryGetPublishedChartDetails(chart_id);
        if (!chart_details) {
            context.status(403).end();
            return resolve();
        }
        
        // TODO: Calculate score from keypoints. For now, just collect keypoints and score that they gave. Can verify later.
        
        // Seems OK, add to DB
        // TODO: invalidate tokens somehow serverside so clients cannot use same tokens until they expire
        await azMySQLManager.submitChartScoreForUser(chart_id, user_id, score, judgements, chart_details.version);
        context.cookie('playToken', '', { maxAge: 1, httpOnly: true, secure: true });
        resolve();
    })
}

export const SendUserPlayToken = (context, req) => {
    return new Promise(async (resolve, reject) => {
        const user_id = context.user.user_id;
        const chart_id = req.params.chart_id;
        
        if (!user_id || !chart_id) 
        {
            context.status(403).end();
            return resolve();
        }
        
        // Lookup chart in DB to get duration
        const chart_details = await azMySQLManager.tryGetPublishedChartDetails(chart_id);
        if (!chart_details) {
            context.status(403).end();
            return resolve();
        }
        
        const chart_duration = parseFloat(chart_details.duration);
        const token_duration = Math.ceil(chart_duration) + EXPIRE_TIME_LEEWAY;
        const token = MakeNewToken({uid: user_id, cid: chart_id, d: chart_duration}, token_duration);
        if (!token) {
            context.status(403).end();
            return resolve();
        }
        
        context.cookie('playToken', token, { maxAge: token_duration, httpOnly: true, secure: true }).end();
        resolve();
    });
};
