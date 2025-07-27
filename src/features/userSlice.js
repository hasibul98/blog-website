import { createSlice } from "@reduxjs/toolkit";

// Function to load state from localStorage
const loadState = () => {
  try {
    const serializedSignedIn = localStorage.getItem('isSignedIn');
    const serializedUserData = localStorage.getItem('userData');
    if (serializedSignedIn === null || serializedUserData === null) {
      return undefined; // Let reducer initialize
    }
    return {
      isSignedIn: JSON.parse(serializedSignedIn),
      userData: JSON.parse(serializedUserData),
    };
  } catch (err) {
    console.error("Error loading state from localStorage", err);
    return undefined; // Let reducer initialize
  }
};

// Function to save state to localStorage
const saveState = (isSignedIn, userData) => {
  try {
    const serializedSignedIn = JSON.stringify(isSignedIn);
    const serializedUserData = JSON.stringify(userData);
    localStorage.setItem('isSignedIn', serializedSignedIn);
    localStorage.setItem('userData', serializedUserData);
  } catch (err) {
    console.error("Error saving state to localStorage", err);
  }
};

const persistedState = loadState();

const userSlice = createSlice({
  name: "user",
  initialState: {
    isSignedIn: persistedState ? persistedState.isSignedIn : false,
    userData: persistedState ? persistedState.userData : null,
    searchInput: "tech",
    blogData: null,
  },
  reducers: {
    setSignedIn: (state, action) => {
      state.isSignedIn = action.payload;
      saveState(state.isSignedIn, state.userData);
    },
    setUserData: (state, action) => {
      // Prioritize imageUrl if it's explicitly passed (e.g., Base64 from Profile page)
      // Otherwise, use photoURL from Firebase Auth user object
      state.userData = action.payload ? {
        uid: action.payload.uid,
        email: action.payload.email,
        name: action.payload.displayName || action.payload.email,
        imageUrl: action.payload.imageUrl || action.payload.photoURL, // Use imageUrl if present, else photoURL
        // Add any other relevant user properties here
      } : null;
      saveState(state.isSignedIn, state.userData);
    },
    setInput: (state, action) => {
      state.searchInput = action.payload;
    },
    setBlogData: (state, action) => {
      state.blogData = action.payload;
    },
  },
});

export const {
  setSignedIn,
  setUserData,
  setInput,
  setBlogData,
} = userSlice.actions;

export const selectSignedIn = (state) => state.user.isSignedIn;
export const selectUserData = (state) => state.user.userData;
export const selectUserInput = (state) => state.user.searchInput;
export const selectBlogData = (state) => state.user.blogData;

export default userSlice.reducer;
