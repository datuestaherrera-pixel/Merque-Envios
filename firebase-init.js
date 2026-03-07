// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmyLDil5EIXJnHr2jbC_pl7ep4n3b6-zo",
  authDomain: "merque-envios.firebaseapp.com",
  projectId: "merque-envios",
  storageBucket: "merque-envios.firebasestorage.app",
  messagingSenderId: "742444964778",
  appId: "1:742444964778:web:83bd33ea73071cdd5329d3",
  measurementId: "G-72HQT2J13M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);