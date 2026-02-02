/**
 * Image Upload Service
 * Handles uploading images to DigitalOcean Spaces
 */
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const spacesConfig = require('../config/spaces');

class ImageService {
    /**
     * Upload multiple images to DO Spaces
     * @param {Array} files - Array of multer file objects
     * @returns {Array} - Array of CDN URLs
     */
    async uploadImages(files) {
        if (!files || files.length === 0) return [];

        const uploadPromises = files.map(file => this.uploadSingleImage(file));
        return Promise.all(uploadPromises);
    }

    /**
     * Upload single image to DO Spaces
     * @param {Object} file - Multer file object
     * @returns {String} - CDN URL
     */
    async uploadSingleImage(file) {
        const ext = path.extname(file.originalname).toLowerCase();
        const key = `products/${uuidv4()}${ext}`;

        const command = new PutObjectCommand({
            Bucket: spacesConfig.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        });

        await spacesConfig.client.send(command);

        return `${spacesConfig.cdnUrl}/${key}`;
    }

    /**
     * Delete image from DO Spaces
     * @param {String} imageUrl - CDN URL of the image
     */
    async deleteImage(imageUrl) {
        try {
            // Extract key from CDN URL
            const urlParts = imageUrl.split('/');
            const key = urlParts.slice(-2).join('/'); // products/filename.jpg

            const command = new DeleteObjectCommand({
                Bucket: spacesConfig.bucket,
                Key: key,
            });

            await spacesConfig.client.send(command);
            return true;
        } catch (error) {
            console.error('Failed to delete image:', error.message);
            return false;
        }
    }
}

module.exports = new ImageService();
