const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const customError = require('../errors/index');
const { attachCookiesToResponse } = require('../utils/jwt');
const createTokenUser = require('../utils/createTokenUser');

const register = async (req, res) => {
    const { email, name, password } = req.body;

    if (await User.findOne({ email })) {
        throw new customError.BadRequestError('This email is already in use, please provide another email')
    }

    const isFirstPerson = await User.countDocuments({}) === 0;
    const role = isFirstPerson ? 'admin' : 'user';

    const user = await User.create({ email, name, password, role });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse(res, tokenUser);

    res.status(StatusCodes.CREATED).json({ user: tokenUser });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new customError.BadRequestError('please provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new customError.UnauthenticatedError('user not found, please provide valid email');
    }


    if (await user.comparePassword(password) === false) {
        throw new customError.UnauthenticatedError('please provide valid password');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse(res, tokenUser);

    res.status(StatusCodes.OK).json({ user: tokenUser });
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(StatusCodes.OK).end();
}

module.exports = {
    register,
    login,
    logout
}