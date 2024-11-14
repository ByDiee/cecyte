// auth.js
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAH6MvrHYih49lF9RY1mdi0L3JK9HFyIP0",
    authDomain: "pdlista-61c4d.firebaseapp.com",
    projectId: "pdlista-61c4d",
    storageBucket: "pdlista-61c4d.appspot.com",
    messagingSenderId: "449596760167",
    appId: "1:449596760167:web:dd667445d003c22f47f4c2",
    measurementId: "G-BDXFNR25C0",
    databaseURL: "https://pdlista-61c4d-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase solo una vez en auth.js
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Configurar expiración de sesión de una hora y cierre de sesión al cerrar la ventana
function setupSessionTimeout() {
    const timeout = 3600000; // 1 hora en milisegundos
    const lastActiveTime = localStorage.getItem("lastActiveTime");

    if (lastActiveTime && Date.now() - lastActiveTime > timeout) {
        auth.signOut(); // Expira la sesión si se supera el tiempo
    }
    localStorage.setItem("lastActiveTime", Date.now());

    // Escucha eventos de actividad y reinicia el contador
    window.addEventListener('mousemove', () => localStorage.setItem("lastActiveTime", Date.now()));
    window.addEventListener('keypress', () => localStorage.setItem("lastActiveTime", Date.now()));
}

// Cierre de sesión al cerrar la ventana
window.addEventListener("beforeunload", () => {
    auth.signOut();
});

// Obtener el rol según la URL de la página
function getRequiredRole() {
    const currentPage = window.location.pathname;
    if (currentPage.includes("pagina1.html") || currentPage.includes("perfilmaestro.html") || 
        currentPage.includes("qr.html") || currentPage.includes("horario.html")) {
        return "admin";
    } else if (currentPage.includes("pagina2.html") || currentPage.includes("perfilalu.html")) {
        return "student";
    } else {
        return null; // Páginas sin restricción de roles
    }
}

// Verificación de acceso y rol
function verifyAccessAndRole() {
    const requiredRole = getRequiredRole();
    
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html'; // Redirige si no está autenticado
            return;
        }
        
        const userId = user.uid;
        localStorage.setItem("userId", userId); // Guardar UID en almacenamiento local
        console.log("Usuario ID:", userId); // Log del ID del usuario
        
        if (requiredRole) {
            // Verificar rol en Firebase
            database.ref(`/users/${userId}/role`).once('value')
                .then((snapshot) => {
                    const role = snapshot.val();
                    console.log("Rol del usuario:", role); // Log del rol del usuario

                    if (role !== requiredRole) {
                        alert("Acceso no autorizado. Redirigiendo...");
                        // Redirigir a la última página permitida
                        window.history.back();
                    }
                })
                .catch((error) => {
                    console.error("Error al obtener el rol del usuario:", error);
                    window.location.href = 'login.html';
                });
        }
    });
}

// Ejecuta la configuración y verificación al cargar la página
window.onload = () => {
    setupSessionTimeout();
    verifyAccessAndRole();
};
