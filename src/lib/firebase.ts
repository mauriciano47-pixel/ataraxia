import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCXZG7kER46oBiYgDhBfwpB1OWfUIFcIGI",
  authDomain: "ataraxia-dce06.firebaseapp.com",
  projectId: "ataraxia-dce06",
  storageBucket: "ataraxia-dce06.firebasestorage.app",
  messagingSenderId: "850676796811",
  appId: "1:850676796811:web:49b5c1d0abe4bd6a75b38e",
  measurementId: "G-RHE3G9YJB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
