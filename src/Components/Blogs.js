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

  const getExcerpt = (htmlContent, maxLength) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    let currentLength = 0;
    let excerpt = '';

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      const node = doc.body.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        // Handle text nodes
        const text = node.textContent;
        if (currentLength + text.length <= maxLength) {
          excerpt += text;
          currentLength += text.length;
        } else {
          excerpt += text.substring(0, maxLength - currentLength) + '...';
          break;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle element nodes (e.g., p, img)
        const outerHTML = node.outerHTML;
        if (currentLength + outerHTML.length <= maxLength) {
          excerpt += outerHTML;
          currentLength += outerHTML.length;
        } else {
          // If adding the whole element exceeds maxLength, try to add partial text if it's a text-containing element
          if (node.textContent && currentLength + node.textContent.length <= maxLength) {
            excerpt += node.outerHTML; // Keep the whole tag for now, but limit content
            currentLength += node.textContent.length; // Count text length for truncation
          } else if (node.tagName === 'IMG') {
            excerpt += outerHTML; // Always include image tags if there's space
            currentLength += outerHTML.length; // Count its approximate length
          } else {
            excerpt += '...'; // Add ellipsis if element cannot fit or is too large
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
            {/* Display truncated content with HTML */}
            <div dangerouslySetInnerHTML={{ __html: getExcerpt(blog.content, 200) }} />
            <Link to={`/blogs/${blog.id}`} className="read-more-link">Read More</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blogs;
