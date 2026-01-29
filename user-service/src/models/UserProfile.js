const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zip: { type: String, default: null },
    country: { type: String, default: null },
    isDefault: { type: Boolean, default: false }
}, { _id: true });

const preferencesSchema = new mongoose.Schema({
    newsletter: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone: {
        type: String,
        default: null
    },
    addresses: [addressSchema],
    preferences: {
        type: preferencesSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

// Virtual for createdAt and updatedAt
userProfileSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
