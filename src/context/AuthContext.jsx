import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../service/FirebaseConfig";
import { signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Helper function to create chat collection for a new user
  const createChatCollection = async (uid) => {
    try {
      const chatRef = doc(db, "chats", uid);
      await setDoc(chatRef, {}); // Create an empty document for the chat collection
    } catch (error) {
      console.error("Failed to create chat collection:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          // If user doesn't exist, create document with default role
          await setDoc(userRef, {
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: "client",
          });

          await createChatCollection(currentUser.uid);
        }

        // Fetch user data, fallback to "client" role if undefined
        const userData = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          role: userSnapshot.data()?.role || "client",
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
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed:", error.message);
    }
  };

  const manualLogin = async (email, password) => {
    try {
      const userRef = doc(db, "supportUsers", "supportuserID");
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const supportUser = userSnapshot.data();

        if (supportUser.email === email && supportUser.password === password) {
          const userData = {
            uid: "supportuserID",
            name: supportUser.username,
            email: supportUser.email,
            role: supportUser.role,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.error("Invalid support user credentials.");
        }
      } else {
        console.error("Support user record not found.");
      }
    } catch (error) {
      console.error("Manual login failed:", error.message);
    }
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

  const isAuthenticated = !!user;

  const value = {
    user,
    setUser,
    isAuthenticated,
    googleLogin,
    manualLogin,
    googleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
