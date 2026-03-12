// firebase-init.js — Inicialización de Firebase usando CDN globals
// Los scripts de Firebase se cargan en el HTML antes de este archivo.

console.log('firebase-init.js cargando...');
console.log('firebase disponible:', typeof firebase);

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
if (typeof firebase !== 'undefined' && firebase.apps) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase inicializado correctamente');
    } else {
        console.log('Firebase ya estaba inicializado');
    }
} else {
    console.error('Firebase no está disponible. Asegúrate de que los scripts de Firebase estén cargados.');
}

// Configurar persistencia de sesión (LOCAL = persiste entre sesiones del navegador)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log('Persistencia de Auth configurada: LOCAL');
    // Escuchar cambios de autenticación
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('Usuario autenticado:', user.email);
        // Guardar en sessionStorage para acceso rápido
        sessionStorage.setItem('usuario_actual', JSON.stringify({
          email: user.email,
          nombre: user.displayName,
          uid: user.uid,
          foto: user.photoURL,
          timestamp: Date.now()
        }));
      } else {
        console.log('No hay usuario autenticado');
        sessionStorage.removeItem('usuario_actual');
      }
    });
  })
  .catch((error) => {
    console.error('Error al configurar persistencia:', error);
  });
