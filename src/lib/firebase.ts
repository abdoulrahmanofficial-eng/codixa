import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChrCv4D91a2w4h7_wzGe8hdct5bP_Aamc",
  authDomain: "codixa-io.firebaseapp.com",
  projectId: "codixa-io",
  storageBucket: "codixa-io.firebasestorage.app",
  messagingSenderId: "305339914704",
  appId: "1:305339914704:web:d1f6be0efb5d89b5c281d5",
  measurementId: "G-KWYMKYHZXQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
