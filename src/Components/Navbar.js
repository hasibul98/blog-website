import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectSignedIn, selectUserData, setSignedIn, setUserData } from "../features/userSlice";
import { auth } from '../firebaseConfig'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut function
import "../styling/navbar.css";

const Navbar = () => {
  const isSignedIn = useSelector(selectSignedIn);
  const userData = useSelector(selectUserData);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase Auth
      dispatch(setSignedIn(false));
      dispatch(setUserData(null));
      history.push("/"); // Navigate to homepage after logout
    } catch (error) {
      console.error("Error signing out: ", error);
      alert(`Error signing out: ${error.message}`);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar__left">
        <Link to="/">
          <h1>BlogSpace</h1>
        </Link>
      </div>
      <div className="navbar__right">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/blogs" className="nav-link">Blogs</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
        {isSignedIn && (
          <>
            <Link to="/profile" className="nav-link">
              <img src={userData?.imageUrl || "https://via.placeholder.com/30"} alt="User Avatar" className="user-avatar" />
              {userData?.name || "Profile"}
            </Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
