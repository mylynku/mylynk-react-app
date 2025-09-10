# MyLynkServer

This is the backend server for MyLYNK, powering the MVP website (https://mylynk.co.in).

## Overview
MyLynkServer is a Node.js/Express application that provides RESTful APIs for user management, session scheduling, authentication, and payment processing.

## Features
- User and Lynker management
- Session scheduling and calendar APIs
- Authentication (OAuth, SSO, JWT)
- Payment integration (Razorpay)
- Centralized error handling and logging

## Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation
```bash
npm install
```

### Configuration
- Edit configuration files in `config/` and `configs/` as needed (database, OAuth, Razorpay, etc.)

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Project Structure
- `routes/` - API route definitions
- `services/` - Business logic and integrations
- `database/` - Database models and connection
- `middlewares/` - Express middlewares
- `config/` & `configs/` - Configuration files
- `logs/` - Application and error logs

## API Documentation

### Health Check Endpoint

#### GET /health

Provides system health status including database connectivity, external services, and resource metrics.

**Query Parameters:**
- `detailed` (boolean): When true, returns detailed health metrics (default: false)

**Response:**
- 200 OK: System is healthy
- 503 Service Unavailable: One or more components are unhealthy

**Example Request:**
```bash
curl -X GET http://localhost:3000/health
```

**Example Response (simple):**
```json
{
  "status": "ok",
  "timestamp": "2025-07-27T11:14:17.656Z",
  "version": "1.0.0",
  "responseTime": "45.23ms"
}
```

**Example Response (detailed):**
```json
{
  "status": "ok",
  "timestamp": "2025-07-27T11:14:17.656Z",
  "version": "1.0.0",
  "responseTime": "45.23ms",
  "details": {
    "database": {
      "status": "healthy"
    },
    "razorpay": {
      "status": "healthy"
    },
    "system": {
      "status": "healthy",
      "memoryUsage": {
        "rss": 12345678,
        "heapTotal": 8765432,
        "heapUsed": 2345678,
        "external": 3456789
      },
      "uptime": 12345.67,
      "cpuUsage": {
        "user": 1234000,
        "system": 567000
      }
    }
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "timestamp": "2025-07-27T11:14:17.656Z",
  "error": "Service Unavailable",
  "responseTime": "45.23ms"
}
```

## Contributing
Please follow best practices and ensure all code is linted and tested before submitting a pull request.

## License
Proprietary. All rights reserved by MyLYNK.