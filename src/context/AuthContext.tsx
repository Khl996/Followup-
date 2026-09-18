import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupervisorUser } from '../types';
import { auth, db, isConfigured } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { INITIAL_SUPERVISORS } from '../data/mockData';

interface AuthContextType {
  currentUser: SupervisorUser | null;
  loading: boolean;
  isAdmin: boolean;
  isFirebaseLive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (userId: string) => void;
  createSupervisorAccount: (email: string, pass: string, name: string, role: 'admin' | 'supervisor') => Promise<void>;
  demoSupervisors: SupervisorUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupervisorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoSupervisors, setDemoSupervisors] = useState<SupervisorUser[]>(() => {
    try {
      const saved = localStorage.getItem('hospital_demo_supervisors');
      return saved ? JSON.parse(saved) : INITIAL_SUPERVISORS;
    } catch {
      return INITIAL_SUPERVISORS;
    }
  });

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
                // Auto-create user doc if missing
                const isAdminEmail = firebaseUser.email?.toLowerCase() === 'khalid.a.kh990@gmail.com';
                const newUser: SupervisorUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  displayName: firebaseUser.displayName || (isAdminEmail ? 'خالد العتيبي' : 'مشرف مرافق'),
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
            // Fallback user
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'مشرف مرافق',
              role: firebaseUser.email?.toLowerCase() === 'khalid.a.kh990@gmail.com' ? 'admin' : 'supervisor',
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
      // Local/Demo Mode Auth
      const savedUserId = localStorage.getItem('hospital_active_user_id');
      const found = demoSupervisors.find(u => u.id === savedUserId) || demoSupervisors[0];
      setCurrentUser(found || null);
      setLoading(false);
    }
  }, [isFirebaseLive]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (isFirebaseLive && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Check local supervisors
      const trimmed = email.trim().toLowerCase();
      const match = demoSupervisors.find(u => u.email.toLowerCase() === trimmed);
      if (match) {
        setCurrentUser(match);
        localStorage.setItem('hospital_active_user_id', match.id);
      } else {
        // Allow creating demo supervisor on the fly
        const newDemoUser: SupervisorUser = {
          id: `demo_${Date.now()}`,
          email: trimmed,
          displayName: trimmed.split('@')[0],
          role: trimmed.includes('admin') || trimmed === 'khalid.a.kh990@gmail.com' ? 'admin' : 'supervisor',
          active: true,
        };
        const updated = [...demoSupervisors, newDemoUser];
        setDemoSupervisors(updated);
        localStorage.setItem('hospital_demo_supervisors', JSON.stringify(updated));
        setCurrentUser(newDemoUser);
        localStorage.setItem('hospital_active_user_id', newDemoUser.id);
      }
    }
  };

  const logout = async () => {
    if (isFirebaseLive && auth) {
      await firebaseSignOut(auth);
    } else {
      setCurrentUser(null);
      localStorage.removeItem('hospital_active_user_id');
    }
  };

  const switchDemoUser = (userId: string) => {
    const found = demoSupervisors.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('hospital_active_user_id', found.id);
    }
  };

  const createSupervisorAccount = async (email: string, pass: string, name: string, role: 'admin' | 'supervisor') => {
    if (isFirebaseLive && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const userDocRef = doc(db, 'users', cred.user.uid);
      const newUser: SupervisorUser = {
        id: cred.user.uid,
        email,
        displayName: name,
        role,
        active: true,
      };
      await setDoc(userDocRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      });
    } else {
      const newSup: SupervisorUser = {
        id: `user_${Date.now()}`,
        email,
        displayName: name,
        role,
        active: true,
      };
      const updated = [...demoSupervisors, newSup];
      setDemoSupervisors(updated);
      localStorage.setItem('hospital_demo_supervisors', JSON.stringify(updated));
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
        switchDemoUser,
        createSupervisorAccount,
        demoSupervisors,
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
