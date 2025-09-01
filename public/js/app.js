//FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBb9UPKIqoTTB68H2J-JXozbWzu1kUOlS8",
    authDomain: "rifa-con-causa-tayson.firebaseapp.com",
    projectId: "rifa-con-causa-tayson",
    storageBucket: "rifa-con-causa-tayson.firebasestorage.app",
    messagingSenderId: "331195222003",
    appId: "1:331195222003:web:29849ab31d10a8b089b486",
    measurementId: "G-12KRHS7D3M"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let selectedRifa = null;
let datos = {};

// Función para cargar datos de Firebase
// Función para cargar los datos de Firebase
async function cargarDatos() {
    const docRef = doc(db, "rifas", "rifa1","rifa3"); // Ajustar según la rifa seleccionada
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        datos = docSnap.data();
        console.log("Datos cargados correctamente:", datos); // Verifica los datos cargados
    } else {
        console.error("No se encontraron datos de las rifas.");
    }
}


// Función para seleccionar la rifa
function seleccionarRifa(rifa, titulo) {
    selectedRifa = rifa;
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("rifaContainer").classList.remove("hidden");
    document.getElementById("tituloRifa").textContent = `Rifa ${titulo}`;
    generarNumeros(rifa);  // Generar los números de la rifa seleccionada
}


// Función para generar los números de la rifa
function generarNumeros(rifa) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    let rifaKey = `rifa${rifa}`;

    if (datos[rifaKey]) {
        Object.keys(datos[rifaKey]).forEach(num => {
            const number = document.createElement("div");
            number.classList.add("number");
            number.textContent = num;

            if (datos[rifaKey][num].ocupado) {
                number.classList.add("occupied");
            }

            // Manejar clics en los números
            number.addEventListener("click", () => {
                number.classList.toggle("selected");
            });

            grid.appendChild(number);
        });
    } else {
        console.error("No se encontraron datos para la rifa seleccionada.");
    }
}


// Función para enviar selección a WhatsApp
function enviarWhatsApp() {
    const numeroWhatsApp = "9611983460";
    let mensaje = `Hola, quiero participar en la Rifa ${selectedRifa}. Mis números seleccionados son: %0A`;

    const selectedNumbers = [];
    document.querySelectorAll(".number.selected").forEach(numElement => {
        selectedNumbers.push(numElement.textContent);
    });

    if (selectedNumbers.length > 0) {
        mensaje += `${selectedNumbers.join(", ")}%0A`;
    }

    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.open(url, "_blank");
}

// Función para cerrar la rifa
function cerrarRifa() {
    selectedRifa = null;
    document.getElementById("rifaContainer").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}

// Cargar los datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos(); // Llamar a cargar los datos de Firebase

    // Asociar los botones a la función seleccionarRifa
    document.getElementById("btnRifa1").addEventListener("click", () => seleccionarRifa(1, 'Carnitas estilos Michoacán'));
    document.getElementById("btnRifa2").addEventListener("click", () => seleccionarRifa(2, 'Pastel para 30 personas'));
    document.getElementById("btnRifa3").addEventListener("click", () => seleccionarRifa(3, 'Toma de fotos'));
    
});
