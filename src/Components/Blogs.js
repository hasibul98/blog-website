import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styling/blogs.css";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogsCollection = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
      const blogsData = blogsCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogsData);
    };

    fetchBlogs();
  }, []);

  // No more comment related state or handlers here, they move to SingleBlog.js

  const truncateContent = (htmlContent, maxLength) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    if (textContent.length > maxLength) {
      return textContent.substring(0, maxLength) + '...';
    } else {
      return textContent;
    }
  };

  return (
    <div className="blogs-container">
      {blogs.map((blog) => (
        <div key={blog.id} className="blog-post">
          <div className="blog-content">
            <h2>{blog.title}</h2>
            {blog.authorName && blog.authorId && (
              <p className="blog-author">
                By: <Link to={`/author/${blog.authorId}`} className="author-link">{blog.authorName}</Link>
              </p>
            )}
            {/* Display truncated content */}
            <div dangerouslySetInnerHTML={{ __html: truncateContent(blog.content, 200) }} />
            <Link to={`/blogs/${blog.id}`} className="read-more-link">Read More</Link>
          </div>
          {/* Comments section removed from here, will be in SingleBlog.js */}
        </div>
      ))}
    </div>
  );
};

export default Blogs;
