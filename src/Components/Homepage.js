import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom"; // Import Link and useHistory
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
      dispatch(setUserData({
        name: user.displayName || user.email,
        email: user.email,
        imageUrl: user.photoURL || null,
      }));
      history.push("/blogs");
    } catch (error) {
      console.error("Firebase Email/Password Login Error: ", error);
      setLoginMessage(`Login Failed: ${error.message}`);
      dispatch(setSignedIn(false));
      dispatch(setUserData(null));
    }
  };

  return (
    <div className="home__page" style={{ display: isSignedIn ? "none" : "" }}>
      {!isSignedIn ? (
        <div className="login__message">
          <h2>📗</h2>
          <h1>A Readers favourite place!</h1>
          <p>
            We provide high quality online resource for reading blogs. Just sign
            up and start reading some quality blogs.
          </p>
          <form onSubmit={handleEmailPasswordLogin} className="login-form">
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
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Homepage;
