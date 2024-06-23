const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getSingleOrder,
    showCurrentUserOrder,
    updateOrder
} = require('../controllers/orderController');
const { authorizePremissions } = require('../middleware/authentication');

router.post('/', createOrder);
router.get('/', authorizePremissions('admin'),getAllOrders);
router.get('/showAllMyOrders', showCurrentUserOrder);
router.get('/:id', getSingleOrder);
router.patch('/:id', updateOrder);

module.exports = router;