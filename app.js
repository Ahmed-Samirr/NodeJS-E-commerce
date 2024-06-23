//Express
const express = require('express');
const app = express();

//Async error handler
require('express-async-errors');

//env
require('dotenv').config();

//Middlewares
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const { authenticateUser } = require('./middleware/authentication');

//DB connect
const connectDB = require('./db/connect');

//Extra useful packages
const { StatusCodes } = require('http-status-codes');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

//Routes
const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');


app.set('trust proxy', 1);
app.use(rateLimiter({
    windwMs: 15 * 60 * 1000,
    max: 60
}));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(cors());

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send('e-commerce api');
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', authenticateUser,orderRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(port, console.log(`connected successfully \nServer is running on port ${port}...`));
    }
    catch (error) {
        console.log(error);
    }
}

start();