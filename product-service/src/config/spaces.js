/**
 * DigitalOcean Spaces Configuration
 * S3-compatible client for image uploads
 */
const { S3Client } = require('@aws-sdk/client-s3');

// Parse region from endpoint
const endpoint = process.env.DO_SPACES_ENDPOINT || 'https://sfo3.digitaloceanspaces.com';
const regionMatch = endpoint.match(/https?:\/\/(?:[\w-]+\.)?(\w+)\.digitaloceanspaces\.com/);
const region = regionMatch ? regionMatch[1] : 'sfo3';

const s3Client = new S3Client({
    endpoint: `https://${region}.digitaloceanspaces.com`,
    region: region,
    credentials: {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
    },
    forcePathStyle: false,
});

const spacesConfig = {
    client: s3Client,
    bucket: process.env.DO_SPACES_BUCKET || 'green-mart-product-storage',
    cdnUrl: process.env.DO_SPACES_CDN_URL || `https://${process.env.DO_SPACES_BUCKET}.${region}.cdn.digitaloceanspaces.com`,
    region: region,
};

module.exports = spacesConfig;
