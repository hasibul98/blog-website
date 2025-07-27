import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams, useHistory } from 'react-router-dom';
import '../styling/admin.css';

const AdminPanel = () => {
    const { blogId } = useParams();
    const history = useHistory();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (blogId) {
            setIsEditing(true);
            const fetchBlogPost = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, 'blogs', blogId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTitle(data.title);
                        setContent(data.content);
                    } else {
                        setMessage('Blog post not found.');
                        history.push('/admin');
                    }
                } catch (error) {
                    console.error('Error fetching blog post for editing: ', error);
                    setMessage(`Error loading post: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            };
            fetchBlogPost();
        } else {
            setIsEditing(false);
            setTitle('');
            setContent('');
        }
    }, [blogId, history]);

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
            let postIdToRedirect = blogId; // Default to current blogId if editing

            if (isEditing) {
                const blogDocRef = doc(db, 'blogs', blogId);
                await updateDoc(blogDocRef, {
                    title,
                    content,
                    updatedAt: serverTimestamp(),
                });
                setMessage('Blog post updated successfully!');
            } else {
                const docRef = await addDoc(collection(db, 'blogs'), {
                    title,
                    content,
                    createdAt: serverTimestamp(),
                    authorId: auth.currentUser.uid,
                    authorName: auth.currentUser.displayName || auth.currentUser.email,
                });
                postIdToRedirect = docRef.id; // Get the ID of the newly created post
                setMessage('Blog post added successfully!');
            }

            // Redirect to the SingleBlog page of the created/updated post
            history.push(`/blogs/${postIdToRedirect}`);

            setTitle('');
            setContent('');
        } catch (error) {
            console.error(isEditing ? 'Error updating document: ' : 'Error adding document: ', error);
            setMessage(`Error ${isEditing ? 'updating' : 'adding'} blog post: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditorChange = (content) => {
        setContent(content);
    };

    const imageUploadHandler = (blobInfo, success, failure) => {
        const file = blobInfo.blob();
        const storageRef = ref(storage, `images/blog_posts/${file.name}`);

        uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                success(downloadURL);
            }).catch(error => {
                failure('Failed to get download URL: ' + error.message);
            });
        }).catch(error => {
            failure('Image upload failed: ' + error.message);
        });
    };

    return (
        <div className="admin-panel-container">
            <h2>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
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
                                'insertdatetime media table paste code help wordcount',
                                'table'
                            ],
                            toolbar: 'undo redo | formatselect | ' +
                                'bold italic underline | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'link image media table | code preview',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            images_upload_handler: imageUploadHandler,
                            image_title: true,
                            automatic_uploads: true,
                            file_picker_types: 'image',
                            file_picker_callback: (cb, value, meta) => {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/*');

                                input.onchange = function () {
                                    const file = this.files[0];
                                    const reader = new FileReader();
                                    reader.onload = function () {
                                        const id = 'blobid' + (new Date()).getTime();
                                        const blobCache = editorRef.current.editorUpload.blobCache;
                                        const base64 = reader.result.split(',')[1];
                                        const blobInfo = blobCache.create(id, file, base64);
                                        blobCache.add(blobInfo);
                                        cb(blobInfo.blobUri(), { title: file.name });
                                    };
                                    reader.readAsDataURL(file);
                                };

                                input.click();
                            }
                        }}
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Blog' : 'Post Blog')}
                </button>
            </form>
            {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
        </div>
    );
};

export default AdminPanel;
