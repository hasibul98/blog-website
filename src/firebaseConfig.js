import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCUGeKcuwwOR9I-_67CFTeOO7wU6csxIg",
  authDomain: "blog-website-dcfe5.firebaseapp.com",
  projectId: "blog-website-dcfe5",
  storageBucket: "blog-website-dcfe5.firebasestorage.app",
  messagingSenderId: "38737969897",
  appId: "1:38737969897:web:f8d6b1f3d257bb4c452678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { auth, db, storage, app };