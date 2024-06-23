const customError = require('../errors/index');
const { isJwtValid } = require('../utils/jwt');

const authenticateUser = (req, res, next) => {
    const token = req.signedCookies.token;

    if (!token) {
        return next(new customError.UnauthenticatedError('Authentication invalid'));
    }

    try {
        const payload = isJwtValid(token);
        req.user = { userName: payload.name, userId: payload.userId, role: payload.role };
        next();
    } 
    catch (error) {
        return next(new customError.UnauthenticatedError('Authentication invalid'));
    }
}

const authorizePremissions = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new customError.UnautorizedError('Unauthorized access'));
        }
        next();
    }
}

module.exports = {
    authenticateUser,
    authorizePremissions

};