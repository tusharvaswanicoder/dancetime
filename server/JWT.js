const jwt = require('jsonwebtoken');

class JWT {
    constructor() {}

    makeToken(email) {
        return jwt.sign(
            { email },
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1d', algorithm: 'HS256'});
    }
    
    // Refresh token if it is expired
    refreshToken(old_token_data) {
        return jwt.sign(
            old_token_data,
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1d', algorithm: 'HS256'});
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

module.exports = _jwt;
