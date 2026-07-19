import { useState, useEffect, createContext, useContext, useRef } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const moduleRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const hasSignal =
      new URLSearchParams(window.location.search).get('admin') === 'true' ||
      !!localStorage.getItem('hadAdminSession');

    if (!hasSignal) {
      setLoading(false);
      return () => {};
    }

    (async () => {
      try {
        const authModule = await import('firebase/auth');
        if (cancelled) return;
        moduleRef.current = authModule;

        const auth = authModule.getAuth();
        unsubRef.current = authModule.onAuthStateChanged(auth, async (firebaseUser) => {
          if (cancelled) return;
          setUser(firebaseUser);
          if (firebaseUser) {
            const tokenResult = await firebaseUser.getIdTokenResult(true);
            if (!cancelled) setAdmin(!!tokenResult.claims.admin);
          } else {
            setAdmin(false);
          }
          if (!cancelled) setLoading(false);
        });
      } catch (err) {
        console.error('Failed to load firebase/auth:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  const signInWithGoogle = () => {
    const { getAuth, signInWithPopup, GoogleAuthProvider } = moduleRef.current;
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getAuth(), provider).then((result) => {
      localStorage.setItem('hadAdminSession', 'true');
      return result;
    });
  };

  const signInWithEmail = (email, password) => {
    const { getAuth, signInWithEmailAndPassword } = moduleRef.current;
    return signInWithEmailAndPassword(getAuth(), email, password).then((result) => {
      localStorage.setItem('hadAdminSession', 'true');
      return result;
    });
  };

  const signOut = () => {
    const { getAuth, signOut: firebaseSignOut } = moduleRef.current;
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
