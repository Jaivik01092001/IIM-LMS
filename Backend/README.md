# IIM-LMS Backend

The backend server for the IIM Learning Management System, built with Node.js, Express, and MongoDB.

## Features

- **RESTful API**: Well-structured API endpoints for all platform functionality
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC) for Educators, University Admins, and Super Admins
- **Security**: Comprehensive security measures including:
  - Password hashing with bcrypt
  - Rate limiting to prevent abuse
  - CORS protection
  - HTTP security headers with Helmet
  - Input validation with Joi
  - MongoDB query sanitization
  - XSS protection
- **Email Integration**: Password reset and notification functionality
- **File Storage**: Integration with Cloudinary for content uploads
- **Database Seeding**: Initial data population for testing and development

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
  - **Body**: 
    ```json
    {
      "email": "user@example.com",
      "password": "your_password"
    }
    ```
- `POST /api/auth/refresh-token` - Refresh access token
  - **Body**: 
    ```json
    {
      "token": "your_refresh_token"
    }
    ```
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
  - **Body**: 
    ```json
    {
      "email": "user@example.com"
    }
    ```
- `POST /api/auth/reset-password` - Reset password with token
  - **Body**: 
    ```json
    {
      "token": "your_reset_token",
      "password": "new_password"
    }
    ```

### Educator
- `GET /api/educator/courses` - Get available courses
- `POST /api/educator/courses/:id/enroll` - Enroll in a course
  - **Body**: 
    ```json
    {
      "userId": "your_user_id"
    }
    ```
- `GET /api/educator/my-courses` - Get enrolled courses
- `GET /api/educator/course/:id` - Get course details
- `GET /api/educator/content` - Get content list
- `POST /api/educator/content` - Create new content
  - **Body**: 
    ```json
    {
      "title": "Content Title",
      "description": "Content Description",
      "file": "file_url"
    }
    ```
- `PUT /api/educator/content/:id` - Update content
  - **Body**: 
    ```json
    {
      "title": "Updated Title",
      "description": "Updated Description"
    }
    ```
- `DELETE /api/educator/content/:id` - Delete content
- `GET /api/educator/profile` - Get profile
- `PUT /api/educator/profile` - Update profile
  - **Body**: 
    ```json
    {
      "name": "Your Name",
      "email": "user@example.com"
    }
    ```

### University Admin
- `GET /api/university/educators` - Get educators list
- `POST /api/university/educator` - Create educator account
  - **Body**: 
    ```json
    {
      "name": "Educator Name",
      "email": "educator@example.com",
      "password": "educator_password"
    }
    ```
- `PUT /api/university/educator/:id` - Update educator
  - **Body**: 
    ```json
    {
      "name": "Updated Educator Name",
      "email": "updated_email@example.com"
    }
    ```
- `GET /api/university/profile` - Get university profile
- `PUT /api/university/profile` - Update university profile
  - **Body**: 
    ```json
    {
      "name": "University Name",
      "address": "University Address"
    }
    ```

### Super Admin
- `GET /api/admin/universities` - Get universities list
- `POST /api/admin/university` - Create university
  - **Body**: 
    ```json
    {
      "name": "New University",
      "location": "University Location"
    }
    ```
- `PUT /api/admin/university/:id` - Update university
  - **Body**: 
    ```json
    {
      "name": "Updated University Name",
      "location": "Updated Location"
    }
    ```
- `GET /api/admin/content` - Get all content
- `PUT /api/admin/content/approve/:id` - Approve content
- `PUT /api/admin/content/reject/:id` - Reject content
- `GET /api/admin/courses` - Get all courses

### CMS
- `GET /api/cms/pages` - Get published pages
- `GET /api/cms/page/:slug` - Get page by slug

### Quiz
- `POST /api/quiz/:courseId` - Create quiz
  - **Body**: 
    ```json
    {
      "title": "Quiz Title",
      "questions": [
        {
          "question": "What is your question?",
          "options": ["Option 1", "Option 2"],
          "answer": "Option 1"
        }
      ]
    }
    ```
- `GET /api/quiz/:quizId` - Get quiz
- `PUT /api/quiz/:quizId` - Update quiz
  - **Body**: 
    ```json
    {
      "title": "Updated Quiz Title"
    }
    ```
- `DELETE /api/quiz/:quizId` - Delete quiz
- `POST /api/quiz/:quizId/submit` - Submit quiz attempt
  - **Body**: 
    ```json
    {
      "answers": [
        {
          "questionId": "question_id",
          "selectedOption": "Option 1"
        }
      ]
    }
    ```
- `GET /api/quiz/:quizId/results` - Get quiz results

## Database Models

- **User**: Educators, University Admins, and Super Admins
- **University**: Educational institutions
- **Course**: Educational courses
- **Content**: Educational materials
- **Quiz**: Assessment tools
- **Certificate**: Course completion certificates
- **CmsPage**: Content management system pages

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file uploads)
- SMTP server access (for emails)

### Installation

1. Clone the repository
