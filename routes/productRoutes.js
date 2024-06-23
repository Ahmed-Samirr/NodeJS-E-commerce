const express = require('express');
const router = express.Router();
const {
    createProduct,
    deleteProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    uploadImage,
    getSingleProductReviews
} = require('../controllers/productController');
const { authenticateUser, authorizePremissions } = require('../middleware/authentication');

router.post('/uploadImage', [authenticateUser, authorizePremissions('admin')] ,uploadImage);
router.post('/', [authenticateUser, authorizePremissions('admin')] ,createProduct);
router.get('/', getAllProducts);
router.get('/reviews/:id', getSingleProductReviews);
router.delete('/:id', [authenticateUser, authorizePremissions('admin')] ,deleteProduct);
router.patch('/:id', [authenticateUser, authorizePremissions('admin')] ,updateProduct);
router.get('/:id', getSingleProduct);

module.exports = router;