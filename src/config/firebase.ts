import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBA3T3YXZZq_mWQH8oYqYUV0CbJe0Znjqk",
  authDomain: "denchikdushnila.firebaseapp.com",
  databaseURL: "https://denchikdushnila-default-rtdb.firebaseio.com",
  projectId: "denchikdushnila",
  storageBucket: "denchikdushnila.firebasestorage.app",
  messagingSenderId: "100458584993",
  appId: "1:100458584993:web:90b2e09272106bab5309e0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
