import React, { useState } from 'react';
import { MantineProvider, Textarea, Button } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/rte';
import { useNotifications } from '@mantine/notifications';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styling/admin.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';


const AdminPanel = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!auth.currentUser) {
      notifications.showNotification({
        title: 'Authentication Required',
        message: 'You must be logged in to post a blog!',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    const isContentEmpty = content.replace(/<[^>]*>/g, '').trim() === '';

    if (!title || isContentEmpty) {
      notifications.showNotification({
        title: 'Missing Information',
        message: 'Title and content are required!',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'blogs'), {
        title,
        content,
        createdAt: serverTimestamp(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
      });

      notifications.showNotification({
        title: 'Success',
        message: 'Blog post added successfully!',
        color: 'green',
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error adding document: ', error);
      notifications.showNotification({
        title: 'Error',
        message: `Error adding blog post: ${error.message}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div className="admin-panel-container">
        <h2>Create New Blog Post</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <Textarea
              placeholder="Enter blog title"
              radius="md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content:</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here..."
            />
          </div>
          <Button type="submit" color="green" loading={loading}>
            {loading ? 'Posting...' : 'Post Blog'}
          </Button>
        </form>
      </div>
    </MantineProvider>
  );
};

export default AdminPanel;
