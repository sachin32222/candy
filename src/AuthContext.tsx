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
  subscriptionPlan?: string;
  razorpay_payment_id?: string;
  waAppId?: string;
  waAppSecret?: string;
  waPhoneNumberId?: string;
  waToken?: string;
  igAppId?: string;
  igAppSecret?: string;
  igAccountId?: string;
  igToken?: string;
  instagramAccountId?: string;
  instagramUsername?: string;
  pageAccessToken?: string;
  metaConnected?: boolean;
  metaConnectedAt?: string;
  automations?: any[];
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: () => Promise<string | void>;
  signInWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsReviewer: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  driveToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing mock reviewer session in localStorage
    const savedMock = localStorage.getItem('candei_mock_auth');
    if (savedMock) {
      try {
        const mockUser = JSON.parse(savedMock);
        setUser(mockUser);
        import('./utils/metaCredentials').then(({ ensureReviewerAccount, REVIEWER_TENANT_ID }) => {
          ensureReviewerAccount().then(async (revProfile) => {
            // Also check if updated profile in Firestore
            try {
              const docSnap = await getDoc(doc(db, 'users', REVIEWER_TENANT_ID));
              if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
                return;
              }
            } catch (e) {}
            setProfile(revProfile as unknown as UserProfile);
          });
        });
      } catch (e) {
        console.error("Failed to parse mock auth:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthError(null);
      if (currentUser) {
        localStorage.removeItem('candei_mock_auth');
        setUser(currentUser);
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
        }
      } else {
        // Only clear if no mock session active
        if (!localStorage.getItem('candei_mock_auth')) {
          setUser(null);
          setProfile(null);
          setDriveToken(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsReviewer = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { ensureReviewerAccount, REVIEWER_MOCK_USER, REVIEWER_TENANT_ID } = await import('./utils/metaCredentials');
      const revProfile = await ensureReviewerAccount();
      localStorage.setItem('candei_mock_auth', JSON.stringify(REVIEWER_MOCK_USER));
      setUser(REVIEWER_MOCK_USER);

      // Check if Firestore has newer state (e.g. after OAuth connection)
      try {
        const snap = await getDoc(doc(db, 'users', REVIEWER_TENANT_ID));
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
          return;
        }
      } catch (e) {}

      setProfile(revProfile as unknown as UserProfile);
    } catch (err: any) {
      console.error("Error logging in as reviewer:", err);
      setAuthError("Failed to initialize reviewer account.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    const { REVIEWER_EMAIL, REVIEWER_PASSWORD } = await import('./utils/metaCredentials');

    if (cleanEmail === REVIEWER_EMAIL.toLowerCase() && cleanPass === REVIEWER_PASSWORD) {
      await loginAsReviewer();
      return { success: true };
    }

    return {
      success: false,
      error: `Invalid credentials. For reviewer access, use ${REVIEWER_EMAIL} and ${REVIEWER_PASSWORD}`
    };
  };

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
        console.warn('Sign-in popup was blocked by browser.');
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (error?.code === 'auth/unauthorized-domain') {
        console.warn(`[Firebase Auth] Domain (${window.location.hostname}) is not in Firebase authorized domains list.`);
        throw new Error(`Domain (${window.location.hostname}) is not in Firebase Authorized Domains. Use the 1-Click Reviewer/Demo login or add this domain in Firebase Console.`);
      }
      console.error('Error signing in', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('candei_mock_auth');
    setUser(null);
    setProfile(null);
    setDriveToken(null);
    try {
      await signOut(auth);
    } catch (e) {}
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const currentUid = user?.uid;
    if (!currentUid) return;
    try {
      const docRef = doc(db, 'users', currentUid);
      await setDoc(docRef, data, { merge: true });
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile((prev) => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.warn("Notice updating profile in Firestore (saved locally):", error);
      setProfile((prev) => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      authError, 
      signIn, 
      signInWithCredentials, 
      loginAsReviewer, 
      logout, 
      updateProfile, 
      driveToken 
    }}>
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
