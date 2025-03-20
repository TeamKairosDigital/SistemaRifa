// let selectedRifa = null;
// const occupiedNumbersByRifa = {
//     1: [5, 12, 25, 37, 50, 63, 75, 88, 99],
//     2: [3, 14, 22, 31, 47, 55, 68, 80, 95],
//     3: [7, 18, 29, 40, 53, 61, 74, 85, 100]
// };
// let selectedNumbers = [];

// function seleccionarRifa(rifa, titulo) {
//     selectedRifa = rifa;
//     document.getElementById("menu").classList.add("hidden");
//     document.getElementById("rifaContainer").classList.remove("hidden");
//     document.getElementById("tituloRifa").textContent = `Rifa ${titulo}`;
//     generarNumeros();
// }

// function generarNumeros() {
//     const grid = document.getElementById("grid");
//     grid.innerHTML = "";
//     selectedNumbers = [];
//     for (let i = 1; i <= 100; i++) {
//         const number = document.createElement("div");
//         number.classList.add("number");
//         number.textContent = i;
        
//         if (occupiedNumbersByRifa[selectedRifa].includes(i)) {
//             number.classList.add("occupied");
//         } else {
//             number.addEventListener("click", () => {
//                 if (number.classList.contains("selected")) {
//                     number.classList.remove("selected");
//                     selectedNumbers = selectedNumbers.filter(num => num !== i);
//                 } else {
//                     number.classList.add("selected");
//                     selectedNumbers.push(i);
//                 }
//             });
//         }
        
//         grid.appendChild(number);
//     }
// }

// function enviarWhatsApp() {
//     const numeroWhatsApp = "9611983460";
//     let mensaje = `Hola, quiero participar en la Rifa ${selectedRifa}. Mis números seleccionados son: %0A`;
//     if (selectedNumbers.length > 0) {
//         mensaje += `${selectedNumbers.join(", ")}%0A`;
//     }
//     const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
//     window.open(url, "_blank");
// }

// function cerrarRifa() {
//     selectedRifa = null;
//     selectedNumbers = [];
//     document.getElementById("rifaContainer").classList.add("hidden");
//     document.getElementById("menu").classList.remove("hidden");
// }

//TODO BIEN EN LOCAL STORAGE
// let selectedRifa = null;
// let selectedNumbers = [];

// // Cargar datos desde localStorage
// let datos = JSON.parse(localStorage.getItem("rifas")) || {
//     rifa1: Array.from({ length: 100 }, (_, i) => ({ numero: i + 1, ocupado: false })),
//     rifa2: Array.from({ length: 100 }, (_, i) => ({ numero: i + 1, ocupado: false })),
//     rifa3: Array.from({ length: 100 }, (_, i) => ({ numero: i + 1, ocupado: false }))
// };

// function seleccionarRifa(rifa, titulo) {
//     selectedRifa = rifa;
//     document.getElementById("menu").classList.add("hidden");
//     document.getElementById("rifaContainer").classList.remove("hidden");
//     document.getElementById("tituloRifa").textContent = `Rifa ${titulo}`;
//     generarNumeros();
// }

// function generarNumeros() {
//     const grid = document.getElementById("grid");
//     grid.innerHTML = "";
//     selectedNumbers = [];
    
//     let rifaKey = `rifa${selectedRifa}`;
    
//     datos[rifaKey].forEach(item => {
//         const number = document.createElement("div");
//         number.classList.add("number");
//         number.textContent = item.numero;
        
//         if (item.ocupado) {
//             number.classList.add("occupied");
//         } else {
//             number.addEventListener("click", () => {
//                 if (number.classList.contains("selected")) {
//                     number.classList.remove("selected");
//                     selectedNumbers = selectedNumbers.filter(num => num !== item.numero);
//                 } else {
//                     number.classList.add("selected");
//                     selectedNumbers.push(item.numero);
//                 }
//             });
//         }
        
//         grid.appendChild(number);
//     });
// }

// function enviarWhatsApp() {
//     const numeroWhatsApp = "9611983460";
//     let mensaje = `Hola, quiero participar en la Rifa ${selectedRifa}. Mis números seleccionados son: %0A`;
    
//     if (selectedNumbers.length > 0) {
//         mensaje += `${selectedNumbers.join(", ")}%0A`;
//     }

//     const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
//     window.open(url, "_blank");
// }

// function cerrarRifa() {
//     selectedRifa = null;
//     selectedNumbers = [];
//     document.getElementById("rifaContainer").classList.add("hidden");
//     document.getElementById("menu").classList.remove("hidden");
// }



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
    const docRef = doc(db, "rifas", "rifa1"); // Ajustar según la rifa seleccionada
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
    document.getElementById("btnRifa1").addEventListener("click", () => seleccionarRifa(1, 'Power Bank'));
    document.getElementById("btnRifa2").addEventListener("click", () => seleccionarRifa(2, 'Kit de maquillaje'));
    document.getElementById("btnRifa3").addEventListener("click", () => seleccionarRifa(3, 'Diseño gratis'));
    
});
