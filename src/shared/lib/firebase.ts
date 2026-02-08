// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUkK5MfXMii_ctoxaxNbCwn-9YY0JP-yE",
  authDomain: "hereon-b8ec2.firebaseapp.com",
  projectId: "hereon-b8ec2",
  storageBucket: "hereon-b8ec2.firebasestorage.app",
  messagingSenderId: "807367507069",
  appId: "1:807367507069:web:7ffa2bdcdc9ded49500514",
  measurementId: "G-REXN7J16SC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);