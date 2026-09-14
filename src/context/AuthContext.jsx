import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  googleProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  getDoc
} from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('useera_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Real Firebase Auth listener with resilient Firestore permission fallback
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName || user.email.split('@')[0],
          email: user.email,
          avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
          role: 'learner'
        };

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            userData.role = userDoc.data().role || 'learner';
          }
        } catch (e) {
          console.warn("Firestore user lookup offline/rules fallback:", e);
        }

        setCurrentUser(userData);
        localStorage.setItem('useera_user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Google One-Click Sign In (Resilient against Firestore Security Rules)
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData = {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
        role: 'learner'
      };

      // Try background Firestore user sync without letting permission errors block login
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          userData.role = userDoc.data().role || 'learner';
        } else {
          await setDoc(userDocRef, {
            ...userData,
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("Firestore background sync skipped due to project rules:", e);
      }

      setCurrentUser(userData);
      localStorage.setItem('useera_user', JSON.stringify(userData));
      return user;
    } catch (err) {
      console.error("Google sign in error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real Email/Password Login
  const loginWithFirebase = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real Email/Password Registration
  const registerWithFirebase = async (name, email, password, role = 'learner') => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      
      const userData = {
        uid: res.user.uid,
        displayName: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        role: role,
        createdAt: new Date().toISOString()
      };
      
      try {
        await setDoc(doc(db, 'users', res.user.uid), userData);
      } catch (e) {
        console.warn("Firestore user creation background fallback:", e);
      }

      setCurrentUser(userData);
      localStorage.setItem('useera_user', JSON.stringify(userData));
      return res.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('useera_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      signInWithGoogle,
      loginWithFirebase,
      registerWithFirebase,
      resetPassword,
      logout,
      isAdmin: currentUser?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
