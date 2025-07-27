import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { selectUserData, setSignedIn, setUserData } from '../features/userSlice';
import { auth, db, storage } from '../firebaseConfig'; // Import auth, db, storage
import { signOut } from 'firebase/auth'; // Import signOut function
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import '../styling/profile.css';

const Profile = () => {
  const userData = useSelector(selectUserData);
  const dispatch = useDispatch();
  const history = useHistory();
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState('');

  const getExcerpt = (htmlContent, maxLength) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    let currentLength = 0;
    let excerpt = '';

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      const node = doc.body.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (currentLength + text.length <= maxLength) {
          excerpt += text;
          currentLength += text.length;
        } else {
          excerpt += text.substring(0, maxLength - currentLength) + '...';
          break;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const outerHTML = node.outerHTML;
        if (currentLength + outerHTML.length <= maxLength) {
          excerpt += outerHTML;
          currentLength += outerHTML.length;
        } else {
          if (node.textContent && currentLength + node.textContent.length <= maxLength) {
            excerpt += node.outerHTML;
            currentLength += node.textContent.length;
          } else if (node.tagName === 'IMG') {
            excerpt += outerHTML;
            currentLength += outerHTML.length;
          } else {
            excerpt += '...';
            break;
          }
        }
      }
    }

    if (excerpt.length < htmlContent.length && !excerpt.endsWith('...')) {
      excerpt += '...';
    }
    return excerpt;
  };

  useEffect(() => {
    console.log("Profile Component Mounted/userData changed");
    console.log("Current userData:", userData);

    const fetchUserPosts = async () => {
      if (userData?.uid) {
        console.log("Fetching posts for user:", userData.uid);
        setLoadingPosts(true);
        setErrorPosts('');
        try {
          const postsQuery = query(
            collection(db, 'blogs'),
            where('authorId', '==', userData.uid)
          );
          const postsSnapshot = await getDocs(postsQuery);
          const postsData = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserPosts(postsData);
          console.log("Fetched posts:", postsData);
          if (postsData.length === 0) {
            console.log("No posts found for this user.");
          }
        } catch (error) {
          console.error("Error fetching user posts: ", error);
          setErrorPosts(`Failed to load your posts: ${error.message}`);
        } finally {
          setLoadingPosts(false);
        }
      } else {
        console.log("User not logged in or userData is missing.");
        setUserPosts([]); // Clear posts if not logged in
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [userData]);

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

  const handleDeletePost = async (postId, postContent) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        // 1. Delete images from Firebase Storage
        const parser = new DOMParser();
        const doc = parser.parseFromString(postContent, 'text/html');
        const images = doc.querySelectorAll('img');

        for (const img of images) {
          const imageUrl = img.src;
          if (imageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
            const imagePath = imageUrl.split('/o/')[1].split('?alt=media')[0];
            const decodedImagePath = decodeURIComponent(imagePath);
            const imageRef = ref(storage, decodedImagePath);
            await deleteObject(imageRef);
            console.log(`Deleted image: ${decodedImagePath}`);
          }
        }

        // 2. Delete document from Firestore
        await deleteDoc(doc(db, 'blogs', postId));

        // 3. Update local state
        setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        alert('Blog post deleted successfully!');
      } catch (error) {
        console.error("Error deleting post: ", error);
        alert(`Error deleting post: ${error.message}`);
      }
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
      </div>
      <button onClick={handleLogout} className="logout-button-profile">Logout</button>

      <h3 className="user-posts-title">Your Blog Posts</h3>
      {loadingPosts ? (
        <p>Loading your posts...</p>
      ) : errorPosts ? (
        <p className="error-message">{errorPosts}</p>
      ) : userPosts.length === 0 ? (
        <p>You haven't posted any blogs yet.</p>
      ) : (
        <div className="user-posts-list">
          {userPosts.map((post) => (
            <div key={post.id} className="user-post-item">
              <h4>{post.title}</h4>
              <div className="post-excerpt" dangerouslySetInnerHTML={{ __html: getExcerpt(post.content, 150) }} />
              <div className="post-actions">
                <Link to={`/edit-blog/${post.id}`} className="edit-button">Edit</Link>
                <button onClick={() => handleDeletePost(post.id, post.content)} className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
