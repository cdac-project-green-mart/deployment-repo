const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: [true, 'Product ID is required'],
        unique: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Quantity cannot be negative']
    },
    reservedQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Reserved quantity cannot be negative']
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Threshold cannot be negative']
    }
}, {
    timestamps: true
});

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function () {
    return this.quantity - this.reservedQuantity;
});

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.lowStockThreshold;
});

// Index for low stock queries
inventorySchema.index({ quantity: 1, lowStockThreshold: 1 });

inventorySchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Inventory', inventorySchema);
