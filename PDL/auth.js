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

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Función para determinar el rol requerido según la URL de la página actual
function getRequiredRole() {
    const currentPage = window.location.pathname;

    if (currentPage.includes("pagina1.html", "perfilmaestro.html", "qr.html", "horario.html")) {
        return "admin"; // Acceso solo para administradores
    } else if (currentPage.includes("pagina2.html", "perfilalu.html")) {
        return "student"; // Acceso solo para estudiantes
    } else {
        return null; // Páginas sin restricción de roles
    }
}

// Función para verificar autenticación, UID y rol
function verifyAccessAndRole() {
    const requiredRole = getRequiredRole();

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // Redirige al login si no hay usuario autenticado
            window.location.href = 'login.html';
            return;
        }
        
        const userId = user.uid;
        localStorage.setItem("userId", userId); // Guardar el UID en almacenamiento local

        if (requiredRole) {
            // Consultar el rol del usuario en Firebase
            firebase.database().ref(`/users/${userId}/role`).once('value')
                .then((snapshot) => {
                    const role = snapshot.val();

                    if (role === requiredRole) {
                        console.log("Acceso autorizado para rol:", role);
                        loadUserProfile(userId); // Carga el perfil del usuario si está autorizado
                    } else {
                        alert("Acceso no autorizado. Redirigiendo...");
                        window.location.href = 'login.html';
                    }
                })
                .catch((error) => {
                    console.error("Error al obtener el rol del usuario:", error);
                    alert("Error al verificar el rol. Redirigiendo...");
                    window.location.href = 'login.html';
                });
        }
    });
}

// Llamar a la función de verificación al cargar la página
window.onload = verifyAccessAndRole;

// Guardar el UID en el almacenamiento local después de la autenticación
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem("userId", user.uid); // Guardar el UID en almacenamiento local
    }
});
