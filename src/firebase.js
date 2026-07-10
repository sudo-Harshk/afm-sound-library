import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9NN6pPcRSrW7tRioJg8phwXXdF44ojtY",
  authDomain: "afm-sound-library.firebaseapp.com",
  projectId: "afm-sound-library",
  storageBucket: "afm-sound-library.firebasestorage.app",
  messagingSenderId: "914724396864",
  appId: "1:914724396864:web:eb5f04fa30aa99453ce4a5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
