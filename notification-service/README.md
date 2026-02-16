# Notification Service - README

## Overview
The Notification Service consumes messages from RabbitMQ queues and sends email notifications via Nodemailer and Gmail SMTP.

## Features
- **Low Stock Alerts**: Notifies admins and vendors when inventory falls below threshold
- **Order Status Updates**: Notifies customers when their order status changes
- **Email Service**: Uses Nodemailer with Gmail SMTP
- **Service Discovery**: Registers with Eureka for service discovery
- **RabbitMQ Consumer**: Consumes from `low-stock-alerts` and `order-status-changes` queues

## Environment Variables
Required environment variables (add to .env.dev):
- `PORT`: Service port (default: 8089)
- `EUREKA_HOST`: Eureka server hostname
- `EUREKA_PORT`: Eureka server port
- `RABBITMQ_HOST`: RabbitMQ hostname
- `RABBITMQ_PORT`: RabbitMQ port (default: 5672)
- `RABBITMQ_USER`: RabbitMQ username
- `RABBITMQ_PASSWORD`: RabbitMQ password
- `AUTH_SERVICE_URL`: Auth service URL for fetching user emails
- `SMTP_HOST`: SMTP server (smtp.gmail.com)
- `SMTP_PORT`: SMTP port (587)
- `SMTP_EMAIL`: Gmail address for sending emails
- `SMTP_APP_PASSWORD`: Gmail app password (16-character code)

## Gmail App Password Setup
1. Enable 2-Step Verification on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use the generated 16-character password in `SMTP_APP_PASSWORD`

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm start
```

## Health Check
- `GET /health` - Service health status
- `GET /actuator/health` - Actuator health endpoint
