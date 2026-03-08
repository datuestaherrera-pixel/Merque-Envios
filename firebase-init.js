// firebase-init.js — Inicialización de Firebase usando CDN globals
// Los scripts de Firebase se cargan en el HTML antes de este archivo.

console.log('firebase-init.js cargando...');

const firebaseConfig = {
  apiKey: "AIzaSyDmyLDil5EIXJnHr2jbC_pl7ep4n3b6-zo",
  authDomain: "merque-envios.firebaseapp.com",
  projectId: "merque-envios",
  storageBucket: "merque-envios.firebasestorage.app",
  messagingSenderId: "742444964778",
  appId: "1:742444964778:web:83bd33ea73071cdd5329d3",
  measurementId: "G-72HQT2J13M"
};

// Inicializar Firebase (solo si no está ya inicializado)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase inicializado correctamente');
} else {
  console.log('Firebase ya estaba inicializado');
}
