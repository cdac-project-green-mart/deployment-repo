/**
 * Quick test script to verify email sending works with Gmail SMTP.
 * Run: node test-email.js
 */
require('dotenv').config({ path: '../.env.dev' });

// Override env vars for standalone test
process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
process.env.SMTP_PORT = process.env.SMTP_PORT || '587';

const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('=== Email Configuration Test ===');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP Email: ${process.env.SMTP_EMAIL}`);
    console.log(`App Password set: ${process.env.SMTP_APP_PASSWORD ? 'YES' : 'NO'}`);
    console.log('');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_APP_PASSWORD,
        },
    });

    // Step 1: Verify SMTP connection
    console.log('Step 1: Verifying SMTP connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');
    } catch (error) {
        console.error('❌ SMTP connection failed:', error.message);
        process.exit(1);
    }

    // Step 2: Send a test email
    console.log('Step 2: Sending test email...');
    try {
        const info = await transporter.sendMail({
            from: `"Green Mart Test" <${process.env.SMTP_EMAIL}>`,
            to: process.env.SMTP_EMAIL, // Send to self
            subject: 'Green Mart Notification Service - Test Email',
            text: `
Green Mart Notification Service Test

This is a test email to verify the notification service email configuration.

If you received this email, your SMTP configuration is working correctly!

Time: ${new Date().toISOString()}

---
Green Mart Notification System
            `.trim(),
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Sent to: ${process.env.SMTP_EMAIL}`);
        console.log('\nCheck your inbox for the test email.');
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        process.exit(1);
    }
}

testEmail();
