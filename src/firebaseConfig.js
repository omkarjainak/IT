import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChvE3HILaIfHJGy7yB1I5hhir_K4Apjx8",
  authDomain: "appointment-9db8d.firebaseapp.com",
  databaseURL: "https://appointment-9db8d-default-rtdb.firebaseio.com",
  projectId: "appointment-9db8d",
  storageBucket: "appointment-9db8d.appspot.com",
  messagingSenderId: "57968344742",
  appId: "1:57968344742:web:dcc4224c4c043e5897be67",
  measurementId: "G-FMYJ57FDGC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestoreDatabase = getFirestore(app);

export default firestoreDatabase;
