const express = require('express');
const router = express.Router();
const {
    createReview,
    getAllreviews,
    getSingleReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/authentication');

router.post('/', authenticateUser, createReview);
router.get('/', getAllreviews);
router.delete('/:id', authenticateUser, deleteReview);
router.patch('/:id', authenticateUser, updateReview);
router.get('/:id', getSingleReview);

module.exports = router;