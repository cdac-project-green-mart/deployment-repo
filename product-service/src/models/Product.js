const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        index: true
    },
    userId: {
        type: String,
        required: [true, 'User ID (vendor/admin) is required'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

// Index for sorting by creation date
productSchema.index({ createdAt: -1 });

// Virtual for id
productSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Product', productSchema);
