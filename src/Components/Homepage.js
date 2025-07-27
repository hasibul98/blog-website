import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  selectSignedIn,
  setSignedIn,
  setUserData,
} from "../features/userSlice";
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

import "../styling/home.css";

const Homepage = () => {
  const isSignedIn = useSelector(selectSignedIn);
  const dispatch = useDispatch();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');

    if (!email || !password) {
      setLoginMessage('Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      dispatch(setSignedIn(true));
      dispatch(setUserData(user));
      history.push("/blogs");
    } catch (error) {
      console.error("Firebase Email/Password Login Error: ", error);
      setLoginMessage(`Login Failed: ${error.message}`);
      dispatch(setSignedIn(false));
      dispatch(setUserData(null));
    }
  };

  return (
    <div className="homepage-container">
      {!isSignedIn ? (
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to BlogSpace</h1>
            <p className="hero-subtitle">Your daily dose of insights and stories.</p>
            <p className="hero-description">
              Discover captivating articles, share your thoughts, and connect with a community of passionate readers and writers.
            </p>
            <div className="hero-actions">
              <Link to="/blogs" className="call-to-action-button">Explore Blogs</Link>
              <Link to="/register" className="secondary-action-button">Join Now</Link>
            </div>
          </div>
          <div className="login-registration-section">
            <form onSubmit={handleEmailPasswordLogin} className="login-form">
              <h2>Login</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
              {loginMessage && <p className="login-error-message">{loginMessage}</p>}
            </form>
            <p className="register-prompt">Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      ) : (
        <div className="signed-in-welcome">
          <h1>Welcome back, {auth.currentUser?.displayName || auth.currentUser?.email}!</h1>
          <p>Ready to explore more blogs?</p>
          <Link to="/blogs" className="call-to-action-button">Go to Blogs</Link>
        </div>
      )}
    </div>
  );
};

export default Homepage;
