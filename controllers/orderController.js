const Order = require('../models/order');
const Product = require('../models/product');
const customError = require('../errors/index');
const checkPermissions = require('../utils/checkPermissions');
const { StatusCodes } = require('http-status-codes');

const fakeStripeApi = async function ({ amount, currency }) {
    const clientSecret = 'secret';
    return { clientSecret, amount };
}

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems.length < 1) {
        throw new customError.BadRequestError('No items provided');
    }

    if (!tax || !shippingFee) {
        throw new customError.BadRequestError('No tax or shipping fee provided');
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new customError.NotFoundError(`No product found with id:${item.product}`);
        }

        const { name, price, image } = product;
        const singleOrderItem = {
            amount: item.amount,
            name, price, image, product: item.product
        }

        orderItems = [...orderItems, singleOrderItem];
        subtotal = subtotal + price * item.amount;
    }

    const totalFee = subtotal + shippingFee + tax;
    const paymentIntent = await fakeStripeApi({
        amount: totalFee,
        currency: 'usd'
    });

    const order = await Order.create({
        tax,
        shippingFee,
        subtotal,
        total: totalFee,
        orderItems,
        user: req.user.userId,
        clientSecret: paymentIntent.clientSecret
    });

    res.status(StatusCodes.CREATED).json({ clientSecret: paymentIntent.clientSecret, order });
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
        throw new customError.NotFoundError(`No order found with id:${orderId}`);
    }

    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
}

const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const {paymentIntentId} = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        throw new customError.NotFoundError(`No order found with id:${orderId}`);
    }

    checkPermissions(req.user, order.user);

    order.paymentId = paymentIntentId;
    order.status = 'paid';
    await order.save();
    
    res.status(StatusCodes.OK).json({ order });
}

const showCurrentUserOrder = async (req, res) => {
    const orders = await Order.find({user: req.user.userId});
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrder,
    showCurrentUserOrder
}