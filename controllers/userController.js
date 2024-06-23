const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const customError = require('../errors/index');
const createTokenUser = require('../utils/createTokenUser');
const { attachCookiesToResponse } = require('../utils/jwt');
const checkPermissions = require('../utils/checkPermissions');

const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password -__v');

    if (!users) {
        throw new customError.NotFoundError('No users found');
    }

    res.status(StatusCodes.OK).json({ users });
}

const getSingleUser = async (req, res) => {
    const { id: userId } = req.params;

    checkPermissions(req.user, userId);
    const user = await User.findOne({ _id: userId }).select('-password');

    if (!user) {
        throw new customError.NotFoundError(`No user found with id ${userId}`);
    }

    res.status(StatusCodes.OK).json({ user });
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json(req.user);
}

const updateUser = async (req, res) => {
    const { name: newName, email: newEmail } = req.body;

    if (!newName || !newEmail) {
        throw new customError.BadRequestError('Please provide name and email');
    }

    const user = await User.findOneAndUpdate(
        { _id: req.user.userId },
        { name: newName, email: newEmail },
        { runValidators: true, new: true }
    );

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse(res, tokenUser);

    res.status(StatusCodes.OK).json({ msg: 'user updated!!', user });
}

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new customError.BadRequestError('please provide old and new password');
    }

    const user = await User.findOne({ _id: req.user.userId });

    if (await user.comparePassword(oldPassword) === false) {
        throw new customError.UnauthenticatedError('old password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({ msg: "Password updated!!" });
}


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}