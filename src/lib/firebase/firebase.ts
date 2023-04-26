import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBlnCm9gtNueFGEb_CkqtFD7Gcj_yY1M0",
  authDomain: "isef23-quiz.firebaseapp.com",
  projectId: "isef23-quiz",
  storageBucket: "isef23-quiz.appspot.com",
  messagingSenderId: "462330911237",
  appId: "1:462330911237:web:9b7ef2926b3d07928a9a6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

