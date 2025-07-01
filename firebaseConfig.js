

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6IuIy2rz2JCZOkz7st743tMBR4PCjoAk",
  authDomain: "authentication-in-recipeweb.firebaseapp.com",
  projectId: "authentication-in-recipeweb",
  storageBucket: "authentication-in-recipeweb.firebasestorage.app",
  messagingSenderId: "74520071834",
  appId: "1:74520071834:web:01cce508143b51000d5923",
  measurementId: "G-M62VVGNY5R"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export Firebase Auth and Firestore instances (using global firebase)
 export const auth = firebase.auth(app);
// export const firestore = firebase.firestore(app); // If you need Firestore
// export const firestore = firebase.firestore(app); 