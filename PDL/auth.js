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
        const storedUserId = localStorage.getItem("userId");

        if (userId !== storedUserId) {
            alert("Redirigiendo a inicio de sesión");
            window.location.href = 'login.html';
            return;
        }
        
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

// Guardar el UID en el almacenamiento local después de la autenticación
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem("userId", user.uid);
    }
});

// Llamar a la función de verificación al cargar la página
verifyAccessAndRole();
