import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styling/admin.css';

const AdminPanel = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const editorRef = useRef(null);

    const log = () => {
        if (editorRef.current) {
            console.log(editorRef.current.getContent());
        }
    };

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

    const handleEditorChange = (content) => {
        setContent(content);
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
                    <Editor
                        apiKey="2qbcd9h7y3bdkosgg934uavdjtjhh10o1p35hv7bg7g8vrws" // Replace with your TinyMCE API key
                        onInit={(evt, editor) => editorRef.current = editor}
                        value={content}
                        onEditorChange={handleEditorChange}
                        init={{
                            height: 500,
                            menubar: true,
                            plugins: [
                                'advlist autolink lists link image charmap print preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount', 'table'
                            ],
                            toolbar: 'undo redo | formatselect | ' +
                                'bold italic underline | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'link image media table | code preview' + 'bullist numlist outdent indent | link image media | code',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
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
