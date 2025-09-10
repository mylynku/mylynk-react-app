# MYLYNK

This repository contains the complete codebase for MyLYNK, the primary MVP website for the company MyLYNK (https://mylynk.co.in).

## Overview
MyLYNK is a platform designed to connect users with Lynkers for a variety of services. The system features robust scheduling, authentication, and payment capabilities, and is built with modern, scalable technologies. This monorepo includes both the frontend (client) and backend (server) applications.

## Repository Structure
- `MyLynkClient/` — Frontend web application (React, TypeScript, Vite, Tailwind CSS)
- `MyLynkServer/` — Backend REST API server (Node.js, Express, MongoDB)

## Key Features

### Platform Features
- **User & Lynker Management:** Secure registration, authentication, and profile management for both users and Lynkers (service providers).
- **Session Scheduling:** Real-time calendar integration, session booking, and management with automated notifications.
- **Payment Integration:** Secure payment processing using Razorpay, with support for multiple payment methods and transaction tracking.
- **Role-Based Access Control:** Granular permissions for users, Lynkers, and admins, enforced at both API and UI levels.
- **Robust Error Handling:** Centralized error logging, user-friendly error messages, and fallback UIs for network or system issues.
- **API Security:** JWT-based authentication, OAuth/SSO support, and input validation to prevent common vulnerabilities.
- **Health Monitoring:** Built-in health check endpoints for system status, database connectivity, and third-party integrations.
- **Scalable Architecture:** Modular codebase, separation of concerns, and support for horizontal scaling.

### Technical Stack
- **Frontend:**
  - React (with functional components and hooks)
  - TypeScript for type safety
  - Vite for fast development and builds
  - Tailwind CSS for utility-first styling
  - Context API for state management
  - Razorpay JS SDK for payment flows
- **Backend:**
  - Node.js with Express.js for RESTful APIs
  - MongoDB for data persistence (Mongoose ODM)
  - JWT, OAuth, and SSO for authentication
  - Centralized error and request logging
  - Modular service and middleware layers
  - Integration with Razorpay for payments
- **DevOps & Tooling:**
  - ESLint and Prettier for code quality
  - Environment-based configuration
  - Production-ready logging and error tracking

## Quick Start

### Prerequisites
- Node.js (v18 or above recommended)
- npm or yarn
- MongoDB (for backend)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/moddagufu/MYLYNK.git
   cd MYLYNK
   ```
2. Follow setup instructions in each subproject's README (`MyLynkClient/README.md`, `MyLynkServer/README.md`).

## Deployment
- The production site is hosted at https://mylynk.co.in
- For deployment, refer to the respective subproject documentation.

## Security & Privacy
- This repository is private and proprietary to MyLYNK. All code, data, and intellectual property are strictly confidential.
- Access is restricted to authorized personnel only. Do not share or distribute any part of this codebase.

## Contributing
- Please open issues or pull requests for improvements or bug fixes.
- Ensure code is linted and tested before submitting.

## License
Proprietary. All rights reserved by MyLYNK.
