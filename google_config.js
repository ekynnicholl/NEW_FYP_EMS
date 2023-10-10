// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyB23Ynd2NjTe7b8fwAv7X2hS5fF9eL5ek8",
	authDomain: "finalyearproject-ffbbd.firebaseapp.com",
	projectId: "finalyearproject-ffbbd",
	storageBucket: "finalyearproject-ffbbd.appspot.com",
	messagingSenderId: "944432400191",
	appId: "1:944432400191:web:419b7431212a6095d0758a",
	measurementId: "G-RJQ8SL7CHB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
