# **Blueprint: Blog Application with Admin Panel and User Features (Updated)**

## **Overview**
This project enhances an existing React blog application by integrating a robust administrative panel and expanded user functionalities. The admin panel empowers authorized users to create, manage, and publish blog posts, including the ability to upload images alongside their textual content. This includes the capability to embed images directly within the text content using a rich text editor, allowing for a more dynamic and interactive post creation experience. User engagement is supported through a commenting system, allowing readers to provide feedback on each blog post. New user features include a redesigned navigation bar, automatic redirection to the blog page after successful login, a dedicated user profile page to display user information, and a clear logout option. **Additionally, users can now view, edit, and delete their own blog posts directly from their profile page, providing comprehensive content management capabilities.** The design prioritizes a modern, intuitive, and mobile-responsive user interface, adhering to best practices in React development and Firebase integration.

## **Detailed Project Outline**

### **Core Functionality**
*   **Blog Listing:** Displays all published blog posts (truncated with HTML content).
*   **Individual Blog View:** Shows a single blog post with its complete content and associated inline images.
*   **Commenting System:** Allows users to post comments on individual blog posts.
*   **Admin Panel:** Provides a dedicated interface for content creators to:
    *   Create new blog posts (title, rich text content with inline images).
    *   Upload images to Firebase Storage (via TinyMCE editor).
    *   Publish posts to Firestore.
*   **User Authentication & Authorization:** Google Sign-in for user authentication. Admin access (future consideration, currently based on direct route access).
*   **User Profile Page:** Displays logged-in user's information. **Now also displays the user's authored blog posts with options to Edit and Delete.**
*   **Logout Functionality:** Allows users to sign out.
*   **Post Editing Functionality:** Users can edit their existing blog posts.
*   **Post Deletion Functionality:** Users can delete their existing blog posts, including associated images from Firebase Storage.

### **Technology Stack**
*   **Frontend:** React.js
*   **Rich Text Editor:** `TinyMCE` via `@tinymce/tinymce-react` for advanced content creation.
*   **Styling:** CSS Modules (or existing project CSS files) for custom designs. Emphasis on modern components and responsive design.
*   **Routing:** `react-router-dom` (Version 5 for compatibility with existing codebase).
*   **State Management:** React's built-in hooks (`useState`, `useContext`) for local state, and Redux Toolkit (`react-redux`, `@reduxjs/toolkit`) for global user state.
*   **Backend:** Firebase
    *   **Firestore:** NoSQL database for storing blog post data (title, rich HTML content, author, timestamp, etc.) and comments.
    *   **Firebase Storage:** Cloud storage for uploaded blog images.
    *   **Firebase Authentication:** (Implicitly used via Google OAuth for user identification).

### **Project Structure**
*   `public/`: Static assets.
*   `src/`: Application source code.
    *   `src/App.js`: Main application component, handles routing.
    *   `src/index.js`: Entry point for React application.
    *   `src/firebaseConfig.js`: Firebase initialization and export.
    *   `src/Components/`: Contains reusable React components.
        *   `AdminPanel.js`: Admin interface for creating new posts. **Will be modified to also handle editing existing posts.**
        *   `Blogs.js`: Component to display blog posts (truncated) and handle comments.
        *   `Homepage.js`: Main landing page with Google Sign-in.
        *   `Navbar.js`: Navigation bar (redesigned).
        *   `Profile.js`: User profile page. **Will be modified to display user's posts with edit/delete options.**
        *   `SingleBlog.js`: Displays a single blog post with full content and comments.
    *   `src/styling/`: CSS files for styling components.
        *   `admin.css`: Styles for the Admin Panel.
        *   `blogs.css`: Styles for blog display.
        *   `home.css`: Styles for the Homepage.
        *   `navbar.css`: Styles for the Navbar.
        *   `profile.css`: Styles for the Profile page.
    *   `src/app/store.js`: Redux store configuration.
    *   `src/features/userSlice.js`: Redux slice for user-related state.

### **Design Principles**
*   **Modern Aesthetics:** Clean, visually balanced layout with attention to spacing, typography, and a vibrant color palette. Use of modern UI components, subtle animations, and intuitive navigation.
*   **Responsiveness:** Ensures optimal viewing experience across various devices (desktop, tablet, mobile).
*   **Accessibility (A11Y):** Implements features to cater to a diverse user base, adhering to WAI-ARIA standards where applicable.
*   **Interactivity:** Buttons, checkboxes, sliders, lists, charts, graphs, and other interactive elements will have subtle shadow and color glow effects.

## **Plan for Current Request: User Post Management on Profile Page**

### **Steps:**

1.  **Update `src/Components/Profile.js`:**
    *   Import `collection`, `query`, `where`, `getDocs`, `deleteDoc`, `doc` from `firebase/firestore` and `ref`, `deleteObject` from `firebase/storage`.
    *   Fetch blog posts from Firestore where `authorId` matches the currently logged-in user's UID.
    *   Display these posts in a list or card format, showing title and a truncated content preview.
    *   Add "Edit" and "Delete" buttons next to each post.
    *   Implement `handleDelete` function:
        *   Confirm deletion with the user.
        *   Delete the document from the `blogs` collection in Firestore.
        *   (Advanced) Parse the HTML content of the deleted blog post to extract image URLs and delete those images from Firebase Storage. This prevents orphaned images.
        *   Update the local state (`userPosts`) after deletion to reflect changes immediately.

2.  **Modify `src/Components/AdminPanel.js` for Editing:**
    *   Accept a `blogId` prop (e.g., via URL parameter when routing).
    *   If `blogId` is present, fetch the existing blog post data from Firestore.
    *   Populate the TinyMCE editor and title input with the fetched data.
    *   Change the `handleSubmit` logic to `updateDoc` instead of `addDoc` if `blogId` is present.
    *   Change the button text from "Post Blog" to "Update Blog" when editing.

3.  **Update `src/App.js` for Routing:**
    *   Add a new route for editing posts, e.g., `<Route path="/edit-blog/:blogId" element={<AdminPanel />} />`.

4.  **Update `src/styling/profile.css` (if needed):**
    *   Add styles for the displayed user posts, edit/delete buttons, and any new UI elements.
