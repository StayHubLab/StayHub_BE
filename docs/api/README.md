# API Documentation

## Authentication

### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "address": {
    "street": "string",
    "ward": "string",
    "district": "string",
    "city": "string"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": {
        "street": "string",
        "ward": "string",
        "district": "string",
        "city": "string"
      },
      "role": "string",
      "isVerified": boolean,
      "createdAt": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Get Profile

```http
GET /api/auth/profile
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "ward": "string",
      "district": "string",
      "city": "string"
    },
    "role": "string",
    "isVerified": boolean,
    "createdAt": "string"
  }
}
```

### Update Profile

```http
PUT /api/auth/profile
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "dob": "string",
  "gender": "string",
  "preferredUtilities": ["string"],
  "preferredPriceRange": {
    "min": number,
    "max": number
  },
  "avatar": "string",
  "verificationDocument": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "ward": "string",
      "district": "string",
      "city": "string"
    },
    "role": "string",
    "isVerified": boolean,
    "updatedAt": "string"
  }
}
```

### Verify Email

```http
GET /api/auth/verify-email/:token
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "id": "string",
    "email": "string",
    "isVerified": true
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid input data",
  "error": "Detailed error message"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message in development"
}
```
