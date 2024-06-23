const Review = require('../models/review');
const Product = require('../models/product');
const customError = require('../errors/index');
const checkPermissions = require('../utils/checkPermissions');
const { StatusCodes } = require('http-status-codes');

const createReview = async (req, res) => {
    const { product: productId } = req.body;

    const isProductValid = await Product.findById(productId);

    if (!isProductValid) {
        throw new customError.NotFoundError(`No product with id: ${productId}`);
    }

    const isReviewSubmitted = await Review.findOne({ product: productId, user: req.user.userId });

    if (isReviewSubmitted) {
        throw new customError.BadRequestError('Already submitted review for this product');
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
}

const getAllreviews = async (req, res) => {
    const review = await Review.find({}).populate({ path: 'product', select: 'name company price' });
    res.status(StatusCodes.OK).json({ review, count: review.length });
}

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findById(reviewId).populate({ path: 'product', select: 'name company price' });

    if (!review) {
        throw new customError.NotFoundError(`No review with id ${reviewId}`);
    }

    res.status(StatusCodes.OK).json({ review });
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !title || !comment) {
        throw new customError.BadRequestError('Please provide review rating, title and comment');
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new customError.NotFoundError(`No review with id ${reviewId}`);
    }

    checkPermissions(req.user, review.user);
    review.title = title;
    review.comment = comment;
    review.rating = rating;
    review.save();
    res.status(StatusCodes.OK).json({ msg: "review updated!", review });
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new customError.NotFoundError(`No review with id ${reviewId}`);
    }

    checkPermissions(req.user, review.user);
    await review.deleteOne();
    res.status(StatusCodes.OK).json({ msg: 'Review deleted!', review });
}

module.exports = {
    createReview,
    getAllreviews,
    getSingleReview,
    updateReview,
    deleteReview
}