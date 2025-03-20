import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBb9UPKIqoTTB68H2J-JXozbWzu1kUOlS8",
    authDomain: "rifa-con-causa-tayson.firebaseapp.com",
    projectId: "rifa-con-causa-tayson",
    storageBucket: "rifa-con-causa-tayson.firebasestorage.app",
    messagingSenderId: "331195222003",
    appId: "1:331195222003:web:29849ab31d10a8b089b486",
    measurementId: "G-12KRHS7D3M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let datos = {};

async function cargarRifa() {
    const boton = document.getElementById("enviarBtn");
    boton.disabled = true;
    // Mostrar spinner mientras carga
    const spinner = document.getElementById("spinner");
    spinner.style.display = "flex";

    const rifaSeleccionada = document.getElementById("rifaSelect").value;
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    try {
        const docRef = doc(db, "rifas", rifaSeleccionada);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            datos = docSnap.data();
        } else {
            console.error("No se encontró la rifa seleccionada:", rifaSeleccionada);
            return;
        }

        let cantidadNumeros = 100;
        if(rifaSeleccionada == 'rifa4'){
            cantidadNumeros = 50;
        }else{
            cantidadNumeros = 100;
        }

        for (let i = 1; i <= cantidadNumeros; i++) {
            const number = document.createElement("div");
            number.classList.add("number");
            number.textContent = i;

            if (datos[i] && datos[i].ocupado) {
                number.classList.add("occupied");
            }

            number.addEventListener("click", () => {
                // Si el número ya está ocupado, no hacer nada
                if (number.classList.contains("occupied")) {
                    return;
                }
                // Si no está ocupado, alterna la selección
                number.classList.toggle("selected");
                actualizarBotonEstado();
            });

            grid.appendChild(number);
        }
    } catch (error) {
        console.error("Error al cargar la rifa:", error);
    } finally {
        // Ocultar el spinner cuando la rifa se haya cargado
        spinner.style.display = "none";
    }
}

function actualizarBotonEstado() {
    const boton = document.getElementById("enviarBtn");
    const selectedNumbers = document.querySelectorAll(".number.selected");
    if (selectedNumbers.length > 0) {
        boton.disabled = false;
    } else {
        boton.disabled = true;
    }
}

function textRifa(){
    switch (document.getElementById("rifaSelect").value) {
            case "rifa1":
                return "Power Bank";
            case "rifa2":
                return "Set de Maquillaje";
            case "rifa3":
                return "Diseño Gratis";
            case "rifa4":
                return " Cena para 2 personas";
    }
}

function enviarWhatsApp() {
    // const numeroWhatsApp = "+529618572327";
    // let rifaSeleccionada = textRifa();
    // let mensaje = `Hola, quiero participar en la Rifa: ${rifaSeleccionada}. Mis números seleccionados son: %0A`;

    // const selectedNumbers = [];
    // document.querySelectorAll(".number.selected").forEach(numElement => {
    //     selectedNumbers.push(numElement.textContent);
    // });

    // if (selectedNumbers.length > 0) {
    //     mensaje += `${selectedNumbers.join(", ")}%0A`;
    // }

    // const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    // window.open(url, "_blank");

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const rifaSeleccionada = textRifa();
    const numeros = Array.from(document.querySelectorAll(".number.selected")).map(el => el.textContent).join(", ");

    const mensaje = `Hola, soy ${nombre}. Quiero participar en la Rifa: ${rifaSeleccionada}. Mi número de WhatsApp es: ${telefono}. Mis números seleccionados son: ${numeros}`;

    const url = `https://wa.me/+529618572327?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

document.addEventListener('DOMContentLoaded', () => {
    const rifaSelect = document.getElementById("rifaSelect");
    rifaSelect.value = "rifa1";
    cargarRifa();
    rifaSelect.addEventListener("change", cargarRifa);

    const enviarBtn = document.getElementById("enviarBtn");
    enviarBtn.addEventListener("click", enviarWhatsApp);

    document.getElementById("nombre").addEventListener("input", actualizarBotonEstado);
    document.getElementById("telefono").addEventListener("input", actualizarBotonEstado);
});