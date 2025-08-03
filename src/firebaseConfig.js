// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyATy8C8GXgcuVubJWAuc1ChKaT6p7dE6R0",
    authDomain: "personalfinance-7ee40.firebaseapp.com",
    projectId: "personalfinance-7ee40",
    storageBucket: "personalfinance-7ee40.firebasestorage.app",
    messagingSenderId: "406806869770",
    appId: "1:406806869770:web:d848a01dbc91d2cc44acf3",
    measurementId: "G-31K8X5BT8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
