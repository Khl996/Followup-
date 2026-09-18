import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupervisorUser } from '../types';
import { auth, db, isConfigured, getSavedFirebaseConfig } from '../firebase/config';
import { initializeApp as initSecondaryApp, deleteApp } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth as getSecondaryAuth,
  signOut as secondarySignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  currentUser: SupervisorUser | null;
  loading: boolean;
  isAdmin: boolean;
  isFirebaseLive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  createSupervisorAccount: (email: string, pass: string, name: string, role: 'admin' | 'supervisor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupervisorUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isFirebaseLive = isConfigured && auth !== null && db !== null;

  useEffect(() => {
    if (isFirebaseLive && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            if (db) {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                setCurrentUser({
                  id: firebaseUser.uid,
                  ...userSnap.data(),
                } as SupervisorUser);
              } else {
                // Auto-create user doc if missing on first login
                const isAdminEmail = firebaseUser.email?.toLowerCase() === 'khalid.a.kh990@gmail.com';
                const newUser: SupervisorUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || (isAdminEmail ? 'مدير النظام' : 'مشرف مرافق'),
                  role: isAdminEmail ? 'admin' : 'supervisor',
                  active: true,
                };
                await setDoc(userDocRef, {
                  ...newUser,
                  createdAt: serverTimestamp(),
                });
                setCurrentUser(newUser);
              }
            }
          } catch (e) {
            console.error('Failed to load user document from firestore', e);
            // Fallback user state from auth profile
            const isAdminEmail = firebaseUser.email?.toLowerCase() === 'khalid.a.kh990@gmail.com';
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (isAdminEmail ? 'مدير النظام' : 'مشرف مرافق'),
              role: isAdminEmail ? 'admin' : 'supervisor',
              active: true,
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isFirebaseLive]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseLive && auth) {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } else {
      throw new Error('خدمة المصادقة غير مهيأة');
    }
  };

  const logout = async () => {
    if (isFirebaseLive && auth) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
  };

  /**
   * Safe Supervisor Account Creation:
   * Uses a secondary Firebase App instance so that the active admin session
   * is NOT replaced or logged out when creating another supervisor's account!
   */
  const createSupervisorAccount = async (email: string, pass: string, name: string, role: 'admin' | 'supervisor') => {
    if (!isFirebaseLive || !db) {
      throw new Error('قاعدة البيانات غير متصلة');
    }

    const config = getSavedFirebaseConfig();
    const secondaryAppName = `SupervisorCreation_${Date.now()}`;
    const secondaryApp = initSecondaryApp(config, secondaryAppName);

    try {
      const secondaryAuth = getSecondaryAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), pass);
      
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      const newUserId = cred.user.uid;

      // Safely sign out the secondary instance
      await secondarySignOut(secondaryAuth);

      // Write supervisor profile document to Firestore using the primary admin session
      const userDocRef = doc(db, 'users', newUserId);
      const newUserDoc: SupervisorUser = {
        id: newUserId,
        email: email.trim(),
        displayName: name.trim() || 'مشرف مرافق',
        role,
        active: true,
      };

      await setDoc(userDocRef, {
        ...newUserDoc,
        createdAt: serverTimestamp(),
      });
    } finally {
      await deleteApp(secondaryApp).catch(() => {});
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'khalid.a.kh990@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        isFirebaseLive,
        loginWithEmail,
        logout,
        createSupervisorAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
