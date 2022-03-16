import jwt from 'jsonwebtoken';

class JWT {
    constructor() {}

    makeToken(email, exp_time) {
        return jwt.sign(
            { email },
            process.env.JWT_SECRET_KEY, 
            { expiresIn: exp_time, algorithm: 'HS256'});
    }
    
    verify (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return {err};
        }
    }
}

const _jwt = new JWT();

export default _jwt;
