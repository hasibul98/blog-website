import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styling/authorProfile.css';

const AuthorProfile = () => {
  const { authorId } = useParams();
  const [authorName, setAuthorName] = useState('Unknown Author');
  const [authorPosts, setAuthorPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuthorPosts = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch posts by this author
        const q = query(
          collection(db, 'blogs'),
          where('authorId', '==', authorId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAuthorPosts(posts);

        // Try to get author name from the first post, or default
        if (posts.length > 0 && posts[0].authorName) {
          setAuthorName(posts[0].authorName);
        } else {
          // Fallback: If no posts or no authorName, try to infer from Redux or fetch from Users collection (if implemented)
          // For now, we'll stick to 'Unknown Author' or email if needed
          setAuthorName(authorId); // Display ID if name is not found
        }

      } catch (err) {
        console.error("Error fetching author posts: ", err);
        setError(`Failed to load posts: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorPosts();
    }
  }, [authorId]);

  if (loading) {
    return <div className="author-profile-container">Loading author's posts...</div>;
  }

  if (error) {
    return <div className="author-profile-container error-message">Error: {error}</div>;
  }

  return (
    <div className="author-profile-container">
      <h2 className="author-profile-title">Posts by {authorName}</h2>
      {authorPosts.length === 0 ? (
        <p>No posts found for this author.</p>
      ) : (
        <div className="author-posts-list">
          {authorPosts.map(post => (
            <div key={post.id} className="author-blog-post-card">
              <h3>{post.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + '...' }} /> {/* Show snippet */}
              <Link to={`/blogs/${post.id}`} className="read-more-link">Read More</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
