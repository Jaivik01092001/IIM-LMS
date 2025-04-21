# IIM Learning Management System (IIM-LMS)

A comprehensive educational platform built with the MERN stack (MongoDB, Express, React, Node.js) that supports multiple user roles: Educator, University/School Admin, Super Admin (IIM), and Staff members.

![IIM-LMS Logo](/Frontend/public/logo.svg)

## Overview

IIM-LMS is a feature-rich learning management system designed to facilitate educational content creation, distribution, and management. The platform provides role-specific interfaces and functionality:

- **Educators**: Create and manage content, enroll in courses, track progress, and earn certificates
- **University/School Admins**: Manage educator accounts and profiles
- **Super Admins (IIM)**: Manage universities/schools, approve content, and oversee the entire platform
- **Staff Members**: Administrative staff with configurable permissions to assist in platform management

## Key Features

- **Authentication & Authorization**: Secure JWT-based authentication with refresh tokens and role-based access control
- **Content Management**: Create, edit, approve, and distribute educational content
- **Course Management**: Organize content into modules and courses with progress tracking
- **Quiz System**: Create and take quizzes with automatic grading
- **Certificate Generation**: Issue certificates upon course completion with verification
- **Multilingual Support**: Full interface available in multiple languages (English, Hindi, Gujarati)
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **CMS Integration**: Built-in content management system for static pages
- **Role-Based Permissions**: Granular permission system for different user roles
- **Staff Management**: Super admins can add staff members with configurable permissions

## Project Structure

The project is organized into three main directories:

- **Backend**: Node.js/Express API server with MongoDB database
- **Frontend**: React application with Redux state management and Tailwind CSS
- **Frontend_Demo**: Alternative frontend implementation with additional features

## API Documentation

A comprehensive Postman collection is available in the root directory:
- [IIM-LMS API Collection](/IIM-LMS-API-Collection.json)

The collection includes all API endpoints with example requests and responses.

## Getting Started

See the README files in the respective directories for detailed setup and usage instructions:

- [Backend README](/Backend/README.md)
- [Frontend README](/Frontend/README.md)
- [Frontend_Demo README](/Frontend_Demo/README.md)

### Quick Start

1. Clone the repository
2. Install dependencies for both backend and frontend:
   ```
   cd Backend && npm install
   cd ../Frontend && npm install
   ```
3. Set up environment variables (see .env.example files)
4. Start the backend server:
   ```
   cd Backend && npm run dev
   ```
5. Start the frontend development server:
   ```
   cd Frontend && npm run dev
   ```

## Technologies Used

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for email services
- Cloudinary for file storage
- Express Rate Limit for API protection
- Helmet for security headers
- XSS-Clean for sanitization

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Axios with interceptors
- i18next for internationalization
- React Quill for rich text editing
- React Toastify for notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Indian Institute of Management (IIM) for project requirements and guidance
- All contributors and maintainers
