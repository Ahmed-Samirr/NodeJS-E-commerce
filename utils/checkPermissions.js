const customError = require('../errors/index');

const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new customError.UnautorizedError('Not autorized to access here');
}

module.exports = checkPermissions;