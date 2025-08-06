import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AuthScreen = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  return isSignIn ? (
    <SignIn onToggleMode={toggleMode} />
  ) : (
    <SignUp onToggleMode={toggleMode} />
  );
};

export default AuthScreen;