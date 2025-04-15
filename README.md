# IIM Learning Management System (IIM-LMS)

A comprehensive educational platform built with the MERN stack (MongoDB, Express, React, Node.js) that supports three user roles: Educator, University/School Admin, and Super Admin (IIM).

![IIM-LMS Logo](/Frontend/public/logo.svg)

## Overview

IIM-LMS is a feature-rich learning management system designed to facilitate educational content creation, distribution, and management. The platform provides role-specific interfaces and functionality:

- **Educators**: Create and manage content, enroll in courses, track progress, and earn certificates
- **University/School Admins**: Manage educator accounts and profiles
- **Super Admins (IIM)**: Manage universities/schools, approve content, and oversee the entire platform

## Key Features

- **Authentication & Authorization**: Secure JWT-based authentication with refresh tokens and role-based access control
- **Content Management**: Create, edit, approve, and distribute educational content
- **Course Management**: Organize content into courses with progress tracking
- **Quiz System**: Create and take quizzes with automatic grading
- **Certificate Generation**: Issue certificates upon course completion
- **Multilingual Support**: Full interface available in multiple languages (English, Hindi, Gujarati)
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## Project Structure

The project is organized into two main directories:

- **Backend**: Node.js/Express API server with MongoDB database
- **Frontend**: React application with Redux state management and Tailwind CSS

## Getting Started

See the README files in the respective directories for detailed setup and usage instructions:

- [Backend README](/Backend/README.md)
- [Frontend README](/Frontend/README.md)

## Technologies Used

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for email services
- Cloudinary for file storage

### Frontend
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- i18next for internationalization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Indian Institute of Management (IIM) for project requirements and guidance
- All contributors and maintainers
