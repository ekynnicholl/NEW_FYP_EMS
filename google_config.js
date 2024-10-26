// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
// 	apiKey: "AIzaSyB23Ynd2NjTe7b8fwAv7X2hS5fF9eL5ek8",
// 	authDomain: "finalyearproject-ffbbd.firebaseapp.com",
// 	projectId: "finalyearproject-ffbbd",
// 	storageBucket: "finalyearproject-ffbbd.appspot.com",
// 	messagingSenderId: "944432400191",
// 	appId: "1:944432400191:web:419b7431212a6095d0758a",
// 	measurementId: "G-RJQ8SL7CHB",
// };

const firebaseConfig = {
	apiKey: "AIzaSyAkhhV9UqdLa0OFqhD-BKzNDXIks3LL9UE",
	authDomain: "firebasic-8d1fa.firebaseapp.com",
	projectId: "firebasic-8d1fa",
	storageBucket: "firebasic-8d1fa.appspot.com",
	messagingSenderId: "491035486450",
	appId: "1:491035486450:web:75485837c8ec0d2bf3c86b",
	measurementId: "G-9XH6C6YQB3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };