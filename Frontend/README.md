# IIM-LMS Frontend

The frontend application for the IIM Learning Management System, built with React, Redux Toolkit, and Tailwind CSS.

## Features

- **Modern UI**: Clean and professional user interface built with Tailwind CSS
- **Responsive Design**: Fully responsive layout compatible with desktop, tablet, and mobile devices
- **State Management**: Centralized state management with Redux Toolkit
- **API Integration**: Secure API communication with axios and interceptors
- **Authentication**: JWT-based authentication with refresh token support
- **Role-Based Access**: Different interfaces for Educators, University Admins, and Super Admins
- **Protected Routes**: Secure route protection based on user roles
- **Form Validation**: Client-side validation for all forms
- **Notifications**: Toast notifications for user feedback

## Pages and Components

### Authentication
- Login
- Forgot Password
- Reset Password

### Educator Interface
- Dashboard
- My Learning (enrolled courses)
- Content Creation
- Course Detail
- Course Learning
- Quiz Taking
- Settings

### University Admin Interface
- Educator Management
- Profile Settings

### Super Admin Interface
- University Management
- Content Approval
- Course Management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see Backend README)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/IIM-LMS.git
cd IIM-LMS/Frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the Frontend directory with the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will start on http://localhost:5173 by default.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable components
├── context/        # React context providers
├── pages/          # Page components
├── redux/          # Redux store and slices
│   ├── auth/       # Authentication state
│   ├── educator/   # Educator state
│   ├── university/ # University state
│   └── admin/      # Admin state
├── utils/          # Utility functions
├── App.jsx         # Main application component
├── index.css       # Global styles
└── main.jsx        # Application entry point
```

## License

This project is licensed under the MIT License.
