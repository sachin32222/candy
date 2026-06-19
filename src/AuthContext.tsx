import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  portfolio?: string;
  insta?: string;
  gbp?: string;
  youtube?: string;
  whatsapp?: string;
  phone?: string;
  familyDiscount?: string;
  corporateDiscount?: string;
  driveConnected?: boolean;
  createdAt?: string;
  paymentStatus?: 'pending' | 'initiated' | 'approved' | 'declined';
  waAppId?: string;
  waAppSecret?: string;
  waPhoneNumberId?: string;
  waToken?: string;
  igAppId?: string;
  igAppSecret?: string;
  igAccountId?: string;
  igToken?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: () => Promise<string | void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  driveToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'New User',
              email: currentUser.email || 'no-email@example.com',
              createdAt: new Date().toISOString(),
              paymentStatus: 'pending',
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          setAuthError("Failed to load user profile. Please try refreshing the page.");
          // We don't call handleFirestoreError here because it throws, which breaks the auth flow
        }
      } else {
        setProfile(null);
        setDriveToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (): Promise<string | void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // @ts-ignore
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setDriveToken(credential.accessToken);
        return credential.accessToken;
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.warn('Sign-in popup was closed by user.');
        return;
      } else if (error?.code === 'auth/cancelled-popup-request') {
        console.warn('Sign-in popup request was cancelled.');
        return;
      } else if (error?.code === 'auth/popup-blocked') {
        console.error('Error signing in', error);
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      }
      console.error('Error signing in', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, data, { merge: true });
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, signIn, logout, updateProfile, driveToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
