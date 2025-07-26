import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill'; // Import Quill directly as before

import 'react-quill/dist/quill.snow.css';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'quill-better-table/dist/quill-better-table.css'; // Add table CSS back
import '../styling/admin.css';

// Re-import quill-better-table modules
import { Table, TableCell, TableRow, Clipboard as TableClipboard } from 'quill-better-table';

const AdminPanel = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quillRef = useRef(null);

  useEffect(() => {
    // Register quill-better-table modules once Quill is available
    // Check if Quill and its imports are defined before registering
    if (Quill && Quill.imports && !Quill.imports['modules/better-table']) {
      try {
        Quill.register({
          'modules/better-table': Table,
          'formats/table': Table,
          'formats/table-row': TableRow,
          'formats/table-cell': TableCell,
          'modules/clipboard': TableClipboard,
        }, true);
        console.log("Quill better-table modules registered.");
      } catch (e) {
        console.error("Error registering Quill modules:", e);
      }
    }
  }, []); // Empty dependency array means this runs once after initial render

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        setLoading(true);
        try {
          const imageRef = ref(storage, `images/blog_content/${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          const imageUrl = await getDownloadURL(imageRef);

          if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.focus();
            const range = editor.getSelection();

            setTimeout(() => {
              if (editor) {
                if (range) {
                  editor.insertEmbed(range.index, 'image', imageUrl);
                } else {
                  editor.insertEmbed(editor.getLength(), 'image', imageUrl);
                }
                setMessage('');
              }
            }, 0);

          }
        } catch (error) {
          console.error('Error uploading image: ', error);
          setMessage(`Error adding image: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    };
  };

  const modules = useMemo(() => {
    const configuredModules = {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'video'],
          ['clean'],
          {'table': ''}, // Table button
        ],
        handlers: {
          image: imageHandler,
        },
      },
    };

    // Conditionally add better-table modules if they are registered and available
    // Check Quill.imports['modules/better-table'] to ensure module is registered before enabling
    if (Quill && Quill.imports && Quill.imports['modules/better-table']) {
        configuredModules['better-table'] = { operationMenu: {} };
        // Only add keyboard bindings if Table is defined and has keyboardBindings
        if (Table && Table.keyboardBindings) {
            configuredModules.keyboard = { bindings: Table.keyboardBindings };
        }
    }

    return configuredModules;
  }, []);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    // Re-add table formats
    'table', 'table-row', 'table-cell',
  ], []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!auth.currentUser) {
      setMessage('You must be logged in to post a blog!');
      setLoading(false);
      return;
    }

    const isContentEmpty = content.replace(/<p><br><\/p>/g, '').trim() === '';

    if (!title || isContentEmpty) {
      setMessage('Title and content are required!');
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

      setMessage('Blog post added successfully!');
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage(`Error adding blog post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel-container">
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <ReactQuill
            key="admin-quill-editor"
            ref={quillRef}
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Write your blog content here..."
            className="quill-editor"
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Posting...' : 'Post Blog'}
        </button>
      </form>
      {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
};

export default AdminPanel;
