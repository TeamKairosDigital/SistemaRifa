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
    const rifaSeleccionada = document.getElementById("rifaSelect").value;
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    const docRef = doc(db, "rifas", rifaSeleccionada);
    const docSnap = await getDoc(docRef);
    datos = docSnap.exists() ? docSnap.data() : {};

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
        if (datos[i]?.ocupado) number.classList.add("occupied");
        number.addEventListener("click", () => abrirModal(i));
        grid.appendChild(number);
    }
}

function abrirModal(numero) {
    document.getElementById("modalNumber").value = numero;
    document.getElementById("numeroEditado").innerText = numero;
    document.getElementById("nombre").value = datos[numero]?.nombre || "";
    document.getElementById("telefono").value = datos[numero]?.numero || "";
    document.getElementById("ocupado").checked = datos[numero]?.ocupado || false;
    new bootstrap.Modal(document.getElementById("numberModal")).show();
}

document.getElementById("guardarNumero").addEventListener("click", () => {
    const numero = document.getElementById("modalNumber").value;
    datos[numero] = {
        ocupado: document.getElementById("ocupado").checked,
        nombre: document.getElementById("nombre").value,
        numero: document.getElementById("telefono").value
    };
    document.querySelectorAll(".number")[numero - 1].classList.toggle("occupied", datos[numero].ocupado);
    bootstrap.Modal.getInstance(document.getElementById("numberModal")).hide();
});

async function guardarDatos() {

    const rifaSeleccionada = document.getElementById("rifaSelect").value;
    await setDoc(doc(db, "rifas", rifaSeleccionada), datos); // Guardar los datos en Firestore
    // alert("Datos guardados correctamente.");
    guardarDatosEnGoogleSheet(); // Guardar los datos en Google Sheets
}

// Función para generar la tabla de la rifa seleccionada
async function generarTablaRifa() {
    const rifaSeleccionada = document.getElementById("rifaSelect").value;
    const tablaContainer = document.getElementById("tablaContainer");
    tablaContainer.innerHTML = ""; // Limpiar contenido previo

    try {
        const docRef = doc(db, "rifas", rifaSeleccionada);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error("No se encontró la rifa seleccionada:", rifaSeleccionada);
            return;
        }

        datos = docSnap.data();
        // console.log("Datos de la rifa seleccionada:", datos);
        // Crear la tabla de Bootstrap
        let tableHTML = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let cantidadNumerosTabla = 100;
        if(rifaSeleccionada == 'rifa4'){
            cantidadNumerosTabla = 50;
        }else{
            cantidadNumerosTabla = 100;
        }

        // Iterar del 1 al 100 para mostrar todos los números
        for (let i = 1; i <= cantidadNumerosTabla; i++) {
            let ocupado = datos[i]?.ocupado || false;
            let nombre = datos[i]?.nombre || "";
            let telefono = datos[i]?.numero || "";

            tableHTML += `
                <tr style="background-color: ${ocupado ? "#c6efce" : "transparent"};">
                    <td>${i}</td>
                    <td>${ocupado ? nombre : ""}</td>
                    <td>${ocupado ? telefono : ""}</td>
                </tr>
            `;
        }

        tableHTML += `</tbody></table>`;
        tablaContainer.innerHTML = tableHTML;
    } catch (error) {
        console.error("Error al generar la tabla:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("rifaSelect").addEventListener("change", cargarRifa);
    document.getElementById("guardarBtn").addEventListener("click", async () => {
        await guardarDatos();
        await generarTablaRifa(); // Se actualiza la tabla después de guardar
    });
    // Llamar a la función cuando se cambie de rifa
    document.getElementById("rifaSelect").addEventListener("change", generarTablaRifa);

    // Cargar automáticamente la rifa 1 al inicio
    document.getElementById("rifaSelect").value = "rifa1";
    await cargarRifa();
    await generarTablaRifa();
});

function descargarExcel() {
    let tabla = document.querySelector("table");
    if (!tabla) {
        alert("No hay datos para exportar.");
        return;
    }
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.table_to_sheet(tabla);
    XLSX.utils.book_append_sheet(wb, ws, "Rifa");
    XLSX.writeFile(wb, "rifa.xlsx");
}


async function guardarDatosEnGoogleSheet() {
    // https://script.google.com/macros/s/AKfycbwR5AcmwJjBz-dVfD6fHnQdVM4TOeL0G4Ynmf7Ty5DuAen7978af3CnY4H5DgmGZUA7/exec

    // https://script.google.com/macros/s/AKfycbzx-awptCc6TEFik9xzs45II1KQyjH4QmVVRQSb7iAzCrAmPsCREwAhy7UoZAvFlBs/exec
    // Mostrar spinner mientras carga
    const spinner = document.getElementById("spinner");
    spinner.style.display = "flex";

    fetch('https://script.google.com/macros/s/AKfycbwR5AcmwJjBz-dVfD6fHnQdVM4TOeL0G4Ynmf7Ty5DuAen7978af3CnY4H5DgmGZUA7/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        mode: 'no-cors', // Evita el error de CORS
    })
    .then(response => {
        // console.log('Estado de la respuesta:', response);
        // if (response.ok) {
        //     return response.text(); // Obtener la respuesta como texto
        // }
        // throw new Error('Error en la respuesta del servidor: ' + response.statusText);
        spinner.style.display = "none"; // Ocultar spinner
        alert("Datos guardados correctamente.");
    })
    // .then(text => {
    //     console.log('Respuesta recibida:', text);
    //     try {
    //         const result = JSON.parse(text); // Intentar parsear la respuesta a JSON
    //         console.log(result.message);
    //         if (result.message === "Datos guardados correctamente") {
    //             alert("Los datos han sido guardados correctamente.");
    //         }
    //     } catch (e) {
    //         console.error('Error al parsear JSON:', e);
    //         alert('Hubo un error al procesar la respuesta del servidor.');
    //     }
    //     spinner.style.display = "none"; // Ocultar spinner
    // })
    // .catch(error => {
    //     console.error('Error al guardar los datos:', error);
    //     spinner.style.display = "none";
    // });
}




document.getElementById("descargarExcel").addEventListener("click", descargarExcel);