# Personal Finance App with Firebase Authentication

This React application includes a complete Firebase authentication system with sign in/sign up functionality.

## Features

- ✅ Firebase Authentication (Email/Password)
- ✅ Protected Routes
- ✅ Material-UI Components
- ✅ Sign In/Sign Up Page with Tabs
- ✅ Dashboard with Logout Functionality
- ✅ Transaction Management

## Setup Instructions

### 1. Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication and set up Email/Password sign-in method
4. Go to Project Settings > General tab
5. Copy your Firebase configuration object
6. Replace the placeholder values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-actual-measurement-id"
};
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm start
```

## How It Works

1. **Authentication Flow**: Users are redirected to `/auth` if not authenticated
2. **Sign In/Sign Up**: Tabbed interface for both login and registration
3. **Protected Dashboard**: Main application content is only accessible after authentication
4. **Automatic Routing**: Authenticated users are redirected to `/dashboard`, unauthenticated users to `/auth`

## File Structure

```
src/
├── components/
│   ├── AuthPage.js          # Sign in/Sign up page
│   ├── Dashboard.js         # Protected dashboard with transactions
│   └── ProtectedRoute.js    # Route protection component
├── contexts/
│   └── AuthContext.js       # Authentication state management
├── firebase.js              # Firebase configuration
├── TransactionTable.js      # Existing transaction component
└── App.js                   # Main app with routing
```

## Authentication Features

- Email validation
- Password strength requirements (min 6 characters)
- Password confirmation for sign up
- Loading states during authentication
- Error handling and display
- Automatic redirect after successful authentication
- Logout functionality

## Next Steps

1. Update your Firebase configuration in `src/firebase.js`
2. Test the authentication flow
3. Customize the UI/styling as needed
4. Add additional authentication providers (Google, GitHub, etc.) if desired