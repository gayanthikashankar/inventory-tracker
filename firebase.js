
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//  web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADRrifjbIRhmnVrLpb2aEtujtczHJV_Ng",
  authDomain: "inventory-management-ff227.firebaseapp.com",
  projectId: "inventory-management-ff227",
  storageBucket: "inventory-management-ff227.appspot.com",
  messagingSenderId: "83789701346",
  appId: "1:83789701346:web:3ace5cca1459cd68f3febb",
  measurementId: "G-ZBPPQ55LXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const storage = getStorage(app);

export {firestore};