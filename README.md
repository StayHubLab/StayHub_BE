# StayHub - Smart Accommodation Platform

StayHub is a modern accommodation platform that connects landlords and tenants in an efficient and secure ecosystem. The name combines "Stay" (residing) and "Hub" (connection center), reflecting our mission to be the central platform for smart accommodation solutions.

## 🌟 Vision & Mission

**Vision:** "Redefine the way people experience renting — smarter, safer, and fully connected in the digital age."

**Mission:** "Build a smart, end-to-end rental platform that empowers users to find, rent, manage, and review boarding houses with confidence and ease."

## 💎 Core Values: HOME

- **H – Honesty:** Transparency and integrity in all information – from room reviews to rental costs
- **O – Optimization:** Optimizing user experience through technology, data, and automation
- **M – Mobility:** Flexibility and ease of use anytime, anywhere – supporting housing needs at every stage
- **E – Empowerment:** Empowering tenants and landlords to make better decisions through smart tools and transparent data

## 🎯 Target Customers

### For Tenants

- **Primary Target:** Young tenants (18-24) with low to moderate income
- **Secondary Target:** Stable tenants (25-35) and older tenants (35-55+)
- **Key Needs:**
  - Finding trustworthy rental options
  - Transparent listings with verified photos
  - Clear contracts and secure deposits
  - Easy issue reporting and resolution
  - Digital payment and management

### For Landlords

- **Primary Target:** Small to medium-scale landlords (3-20 rooms)
- **Key Needs:**
  - Efficient tenant screening
  - Automated management system
  - Digital contract and payment tracking
  - Maintenance request handling
  - Tenant evaluation system

## 🛠 Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File Upload)
- Winston (Logging)
- Jest (Testing)

### Frontend (React)

- React.js
- Redux Toolkit
- React Router
- Material-UI
- Axios
- React Query
- Jest & React Testing Library

## 📦 Installation & Setup

### Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.x
- npm or yarn

### Backend Setup

1. Clone repository:

```bash
git clone https://github.com/PTienhocSE/StayHub.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stayhub
JWT_SECRET=your_jwt_secret
```

4. Start development server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm start
```

## 📁 Project Structure

### Backend

```
stayhub/
├── src/
│   ├── config/         # Configuration
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.js          # Entry point
├── tests/              # Unit tests
├── uploads/            # Uploaded files
└── logs/              # Log files
```

### Frontend

```
frontend/
├── src/
│   ├── assets/        # Static files
│   ├── components/    # Reusable components
│   ├── features/      # Feature-based modules
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── store/         # Redux store
│   ├── utils/         # Utility functions
│   └── App.js         # Root component
└── public/            # Public assets
```

## 🔑 Core Features

### For Tenants

- Smart search with map and advanced filters
- Real-time notifications for matching rooms
- AI-powered recommendations
- 24/7 chatbot assistance
- Digital contract management
- Issue reporting and tracking
- Payment history and reminders
- Two-way review system

### For Landlords

- Multi-property management
- Automated rent collection
- Digital contract management
- Maintenance workflow
- Tenant screening and history
- Financial reporting
- Two-way review system

## 🧪 Testing

### Backend Tests

```bash
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Contributing

1. Fork repository
2. Create new branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

This project is licensed under MIT License - see [LICENSE](LICENSE) file for details.

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
