const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/userController');
const { authorizePremissions } = require('../middleware/authentication');

router.get('/', authorizePremissions('admin') ,getAllUsers);
router.get('/showMe', showCurrentUser);
router.patch('/updateUser', updateUser);
router.patch('/updateUserPassword', updateUserPassword);
router.get('/:id', getSingleUser);

module.exports = router;