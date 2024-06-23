const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "please provide product name"],
        maxlength: [100, "product name cannot be more than 100 character"]
    },
    price: {
        type: Number,
        required: [true, "please provide product price"],
        default: 0
    },
    description: {
        type: String,
        required: [true, "please provide product description"],
        maxlength: [1000, "product description cannot be more than 100 character"]
    },
    image: {
        type: String,
        default: "/uploads/example.jpeg"
    },
    category: {
        type: String,
        required: [true, "please provide product category"],
        enum: ["office", "kitchen", "bedroom"]
    },
    company: {
        type: String,
        required: [true, "please provide company"],
        enum: {
            values: ["ikea", "liddy", "marcos"],
            message: "{VALUE} is not supported"
        }
    },
    colors: {
        type: [String],
        required: true
    },
    featured: {
        type: Boolean,
        required: false
    },
    freeShipping: {
        type: Boolean,
        required: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
});

productSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', productSchema);