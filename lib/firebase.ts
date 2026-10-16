import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-89f55",
  appId: "1:65494382485:web:145678d35df5d0c0f7a89c",
  apiKey: "AIzaSyAx8bSuB3QgweeThUpjcRV_iFTCoNNVOCQ",
  authDomain: "ai-studio-applet-webapp-89f55.firebaseapp.com",
  storageBucket: "ai-studio-applet-webapp-89f55.firebasestorage.app",
  messagingSenderId: "65494382485"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-86aef05b-98f2-423e-8c28-d53e8f2ea572");
