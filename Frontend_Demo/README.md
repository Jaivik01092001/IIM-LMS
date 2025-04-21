# IIM-LMS Frontend Demo

An enhanced frontend implementation for the IIM Learning Management System, built with React, Redux Toolkit, and Tailwind CSS. This version includes additional features and UI improvements over the standard frontend.

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
- **Multilingual Support**: Full internationalization with i18next (English, Hindi, Gujarati)
- **Rich Text Editing**: Content creation with React Quill

## Pages and Components

### Authentication
- Login
- Forgot Password
- Reset Password

### Educator Interface
- Dashboard
- My Learning (enrolled courses)
- Content Creation
- My Content
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
- CMS Page Builder
- Role Management
- Staff Management

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

## Internationalization

The application supports multiple languages through i18next. Language files are located in the `src/locales` directory:

- `en.json` - English translations
- `hi.json` - Hindi translations
- `gu.json` - Gujarati translations

To add a new language:
1. Create a new JSON file in the `src/locales` directory
2. Import and add the new language in `src/i18n.js`

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable components
├── context/        # React context providers
├── locales/        # Translation files
├── pages/          # Page components
├── redux/          # Redux store and slices
│   ├── auth/       # Authentication state
│   ├── educator/   # Educator state
│   ├── university/ # University state
│   ├── admin/      # Admin state
│   ├── role/       # Role management state
│   └── staff/      # Staff management state
├── utils/          # Utility functions
├── App.jsx         # Main application component
├── i18n.js         # Internationalization setup
├── index.css       # Global styles
└── main.jsx        # Application entry point
```

## Demo Accounts

The application includes demo accounts for testing:

- **Educator**:
  - Email: educator@example.com
  - Password: password

- **University Admin**:
  - Email: school@example.com
  - Password: password

- **Super Admin**:
  - Email: admin@example.com
  - Password: password

## License

This project is licensed under the MIT License.