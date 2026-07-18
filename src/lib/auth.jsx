import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setLoading(false);
      return;
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setAdmin(!!tokenResult.claims.admin);
      } else {
        setAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getAuth(), provider);
  };

  const signInWithEmail = (email, password) => {
    return signInWithEmailAndPassword(getAuth(), email, password);
  };

  const signOut = () => {
    return firebaseSignOut(getAuth());
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
