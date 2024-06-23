const Product = require('../models/product');
const Review = require('../models/review');
const customError = require('../errors/index');
const { StatusCodes } = require('http-status-codes');
const path = require('path');

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json(product);
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({ products, count: products.length });
}

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findById(productId).populate('reviews');

    if (!product) {
        throw new customError.NotFoundError(`No product found with id: ${productId}`);
    }

    res.status(StatusCodes.OK).json({ product });
}

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByIdAndUpdate(productId, req.body, { runValidators: true, new: true });

    if (!product) {
        throw new customError.NotFoundError(`No product found with id: ${productId}`);
    }

    res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
        throw new customError.NotFoundError(`No product found with id: ${productId}`);
    }

    await product.deleteOne();
    res.status(StatusCodes.OK).json({ msg: "Product removed!", product });
}

const uploadImage = async (req, res) => {
    if (!req.files) {
        throw new customError.BadRequestError('No file uploaded');
    }

    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith('image')) {
        throw new customError.BadRequestError('Please upload image');
    }

    const imageMaxSize = 1024 * 1024 * 3;

    if (productImage.size > imageMaxSize) {
        throw new customError.BadRequestError('Please upload smaller image');
    }

    const imagePath = path.join(__dirname, '../public/uploads/', `${productImage.name}`);
    await productImage.mv(imagePath);

    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
}

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({product: productId});
    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getSingleProductReviews
}