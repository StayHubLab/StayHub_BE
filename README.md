# StayHub Backend

This is the backend API for StayHub, a platform for finding and managing rental properties.

## Features

- User authentication and authorization
- Property management
- Booking system
- Payment integration
- File uploads
- Email notifications
- Rate limiting
- Caching
- API documentation

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- JWT Authentication
- Multer
- Nodemailer
- Jest
- ESLint
- Prettier

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PTienhocSE/StayHub.git
cd stayhub/backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stayhub
MONGODB_URI_TEST=mongodb://localhost:27017/stayhub_test

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Payment Gateway
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_TMN_CODE=your_vnpay_tmn_code

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
CORS_ORIGIN=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:5000`.

## Available Scripts

- `npm start` - Runs the app in production mode
- `npm run dev` - Runs the app in development mode with hot reload
- `npm test` - Runs the test suite
- `npm run lint` - Runs ESLint
- `npm run format` - Runs Prettier
- `npm run seed` - Seeds the database with sample data
- `npm run docs` - Generates API documentation

## Project Structure

```
src/
  ├── config/        # Configuration files
  ├── controllers/   # Route controllers
  ├── middlewares/   # Custom middlewares
  ├── models/        # Database models
  ├── routes/        # API routes
  ├── services/      # Business logic
  ├── utils/         # Utility functions
  └── app.js         # Express app
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 