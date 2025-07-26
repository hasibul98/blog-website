import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { selectUserData, setSignedIn, setUserData } from '../features/userSlice';
import { auth } from '../firebaseConfig'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut function
import '../styling/profile.css';

const Profile = () => {
  const userData = useSelector(selectUserData);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase Auth
      dispatch(setSignedIn(false));
      dispatch(setUserData(null));
      history.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
      alert(`Error signing out: ${error.message}`);
    }
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <p className="profile-message">Please log in to view your profile.</p>
        <button onClick={() => history.push('/')} className="login-redirect-button">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>
      <div className="profile-info">
        <img
          src={userData.imageUrl || "https://via.placeholder.com/150"}
          alt="Profile Avatar"
          className="profile-avatar"
        />
        <p className="profile-detail"><strong>Name:</strong> {userData.name}</p>
        <p className="profile-detail"><strong>Email:</strong> {userData.email}</p>
        {/* Add more user details if available from Google OAuth data */}
      </div>
      <button onClick={handleLogout} className="logout-button-profile">Logout</button>
    </div>
  );
};

export default Profile;
