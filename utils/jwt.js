const jwt = require('jsonwebtoken');

const createJWT = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
    return token;
}

const isJwtValid = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

const attachCookiesToResponse = (res, payload) => {
    const token = createJWT(payload);

    res.cookie('token', token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === 'production'
    });
}

module.exports = {
    createJWT,
    isJwtValid,
    attachCookiesToResponse
}