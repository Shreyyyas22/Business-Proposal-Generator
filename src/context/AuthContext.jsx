import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../service/FirebaseConfig";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        // If the user doesn't exist in Firestore, create their document
        if (!userSnapshot.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: "client", // Default role
          });

          // Automatically create a chat collection for the new user
          await createChatCollection(currentUser.uid);
        }

        // Fetch user data including the role
        const userData = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          role: userSnapshot.data().role, // Fetching role
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = result.user;
      const userRef = doc(db, "users", credential.uid);
      const userSnapshot = await getDoc(userRef);

      // If the user doesn't exist in Firestore, create their document
      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          uid: credential.uid,
          name: credential.displayName,
          email: credential.email,
          photoURL: credential.photoURL,
          role: "client", // Default role
        });

        // Automatically create a chat collection for the new user
        await createChatCollection(credential.uid);
      }

      // Fetch user data including the role
      const userData = {
        uid: credential.uid,
        name: credential.displayName,
        email: credential.email,
        photoURL: credential.photoURL,
        role: userSnapshot.data().role, // Fetching role
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Google login failed:", error.message);
    }
  };

  const manualLogin = async (email, password) => {
    try {
      // Implement login logic for support users
      const userRef = doc(db, "supportUsers", "supportuserID"); // Change this path as necessary
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const supportUser = userSnapshot.data();

        // Check if the provided email and password match the stored support user credentials
        if (supportUser.email === email && supportUser.password === password) {
          // Set user data for support user
          const userData = {
            uid: "supportuserID", // You can also fetch this dynamically
            name: supportUser.username,
            email: supportUser.email,
            role: supportUser.role,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.error("Invalid credentials for support user.");
        }
      } else {
        console.error("Support user not found.");
      }
    } catch (error) {
      console.error("Manual login failed:", error.message);
    }
  };

  const createChatCollection = async (uid) => {
    // Create a chat collection for the new user
    const chatRef = doc(db, "chats", uid); // Assuming chats is a collection where each document is a user
    await setDoc(chatRef, {}); // Create an empty document for the chat collection
  };

  const googleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const isAuthenticated = !!user; // Check if user is authenticated

  const value = {
    user,
    setUser, // Ensure setUser is passed in the context
    isAuthenticated,
    googleLogin,
    manualLogin, // Add manualLogin method to the context
    googleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
