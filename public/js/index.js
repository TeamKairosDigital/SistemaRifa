import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

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
let rifaSeleccionada = "rifa1";

const telefonoInput = document.getElementById("telefono");

async function cargarRifa() {
    const boton = document.getElementById("enviarBtn");
    boton.disabled = true;
    // Mostrar spinner mientras carga
    const spinner = document.getElementById("spinner");
    const spinnerText = spinner.querySelector('.spinner-text');
    spinnerText.textContent = "Cargando rifa...";
    spinner.style.display = "flex";

    rifaSeleccionada = document.getElementById("rifaSelect").value;
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

        let cantidadNumeros = 80;

        for (let i = 1; i <= cantidadNumeros; i++) {
            const number = document.createElement("div");
            number.classList.add("number");
            number.textContent = i;

            // Verificar si está ocupado (pago confirmado) o pendiente
            if (datos[i] && datos[i].ocupado && datos[i].pago) {
                number.classList.add("occupied");
            } else if (datos[i] && datos[i].pago === false) {
                number.classList.add("pending");
            }

            number.addEventListener("click", () => {
                // Si el número ya está ocupado y pagado, no hacer nada
                if (number.classList.contains("occupied")) {
                    return;
                }
                // Si está pendiente, no permitir seleccionar
                if (number.classList.contains("pending")) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Boleto Pendiente',
                        text: 'Este boleto ya está reservado y pendiente de pago.',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }
                // Si no está ocupado ni pendiente, alterna la selección
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
    const name = document.getElementById("nombre");
    const tipoPago = document.getElementById("tipoPago");
    console.log(telefonoInput.value.length);
    if (selectedNumbers.length > 0 && name.value.length > 0 && tipoPago.value !== "") {
        boton.disabled = false;
    } else {
        boton.disabled = true;
    }
}

function textRifa(){
    switch (rifaSeleccionada) {
            case "rifa1":
                return "Carnitas estilos Michoacán";
            case "rifa2":
                return "Pastel para 30 personas";
            case "rifa3":
                return "Toma de fotos";
    }
}

async function enviarWhatsApp() {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const tipoPago = document.getElementById("tipoPago").value;
    const rifaTexto = textRifa();
    const numeros = Array.from(document.querySelectorAll(".number.selected")).map(el => el.textContent);
    const cantidadBoletos = numeros.length;
    const total = cantidadBoletos * 50;

    // Mostrar spinner mientras se procesa
    const spinner = document.getElementById("spinner");
    const spinnerText = spinner.querySelector('.spinner-text');
    spinnerText.textContent = "Guardando tu reserva en la base de datos...";
    spinner.style.display = "flex";

    try {
        // Guardar en Firebase
        await guardarEnFirebase(nombre, telefono, tipoPago, numeros);

        // Ocultar spinner
        spinner.style.display = "none";

        // Preparar mensaje
        const mensaje = `Hola, soy ${nombre}.\n\nQuiero participar en la Rifa: ${rifaTexto}.\n\n- Mi número de WhatsApp es: ${telefono}.\n\n- Mis números seleccionados son: ${numeros.join(", ")}\n\n- El total a pagar es de: $${total} pesos\n\n- Tipo de pago: ${tipoPago === 'transferencia' ? 'Transferencia Bancaria (Comprobante de pago PENDIENTE)' : 'Efectivo'}\n\n- Estado: PENDIENTE DE PAGO`;

        const url = `https://wa.me/+529613210411?text=${encodeURIComponent(mensaje)}`;

        // Mostrar confirmación ANTES de abrir WhatsApp
        await Swal.fire({
            icon: 'success',
            title: '¡Boletos reservados!',
            text: 'Tus boletos han sido reservados. Ahora se abrirá WhatsApp para que envíes tu comprobante.',
            confirmButtonText: 'Continuar'
        });

        // Intentar abrir WhatsApp
        try {
            // Método más confiable en móviles (iOS/Android)
            window.location.href = url;

            // Como respaldo, usar window.open (ej. escritorio con pop-up permitido)
            setTimeout(() => {
                const w = window.open(url, "_blank", "noopener,noreferrer");
                if (!w || w.closed || typeof w.closed === 'undefined') {
                    console.log('Pop-up bloqueado, redirigiendo directamente...');
                    window.location.href = url;
                }
            }, 500);
        } catch (error) {
            console.error('Error al abrir WhatsApp, redirigiendo...', error);
            window.location.href = url;
        }

        // Limpiar selección
        limpiarSeleccion();

    } catch (error) {
        // Ocultar spinner en caso de error
        spinner.style.display = "none";

        console.error("Error al guardar en Firebase:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al reservar tus boletos. Inténtalo de nuevo.',
            confirmButtonText: 'Entendido'
        });
    }
}


async function guardarEnFirebase(nombre, telefono, tipoPago, numeros) {
    const docRef = doc(db, "rifas", rifaSeleccionada);
    
    // Obtener datos actuales
    const docSnap = await getDoc(docRef);
    let datosActuales = docSnap.exists() ? docSnap.data() : {};
    
    // Agregar cada número seleccionado
    numeros.forEach(numero => {
        datosActuales[numero] = {
            nombre: nombre,
            numero: telefono,
            tipoPago: tipoPago,
            ocupado: false, // No está ocupado hasta que se confirme el pago
            pago: false,    // Pendiente de pago
            fechaReserva: new Date().toISOString()
        };
    });
    
    // Guardar en Firebase
    await setDoc(docRef, datosActuales);
    
    // Ejecutar script de Google Sheets
    await ejecutarScriptGoogleSheets();
}

async function ejecutarScriptGoogleSheets() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxeVwGT4i51ThlV0b6NHyOrdFG69lrVLyC11amxDUBeFavIJLKLUImQVoTg-DjRr06x/exec', {
            method: 'GET'
        });
        const data = await response.json();
        console.log('Respuesta:', data);
    } catch (error) {
        console.error('Error al ejecutar script de Google Sheets:', error);
    }
}


function limpiarSeleccion() {
    // Limpiar números seleccionados
    document.querySelectorAll(".number.selected").forEach(num => {
        num.classList.remove("selected");
    });
    
    // Limpiar inputs
    document.getElementById("nombre").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("tipoPago").value = "";
    
    // Deshabilitar botón
    document.getElementById("enviarBtn").disabled = true;
    
    // Recargar la rifa para mostrar el nuevo estado
    cargarRifa();
}

document.addEventListener('DOMContentLoaded', () => {
    const rifaSelect = document.getElementById("rifaSelect");
    rifaSelect.value = "rifa1";
    cargarRifa();
    rifaSelect.addEventListener("change", cargarRifa);

    const enviarBtn = document.getElementById("enviarBtn");
    enviarBtn.addEventListener("click", enviarWhatsApp);

    document.getElementById("nombre").addEventListener("input", actualizarBotonEstado);
    document.getElementById("tipoPago").addEventListener("change", actualizarBotonEstado);

    telefonoInput.addEventListener("input", function (e) {
        let input = this.value.replace(/\D/g, ""); // quitar todo lo que no sea dígito
    
        if (input.length > 10) input = input.slice(0, 10); // limitar a 10 dígitos
    
        // aplicar formato 3 3 4
        let formatted = input;
        if (input.length > 6) {
          formatted = input.slice(0, 3) + " " + input.slice(3, 6) + " " + input.slice(6);
        } else if (input.length > 3) {
          formatted = input.slice(0, 3) + " " + input.slice(3);
        }
    
        this.value = formatted;
    });
});

const tarjeta = document.getElementById('tarjeta');

tarjeta.addEventListener('click', () => {
  tarjeta.classList.toggle('girada');
});

// Manejar los clics en los íconos de copiar
document.querySelectorAll('.copy-icon').forEach(icon => {
  icon.addEventListener('click', (event) => {
    event.stopPropagation();
    const idElemento = icon.getAttribute('data-target');
    const elemento = document.getElementById(idElemento);
    const texto = elemento.getAttribute('data-copy') || elemento.textContent.trim();
    navigator.clipboard.writeText(texto).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copiado',
            text: `Se copió: ${texto}`,
            timer: 2000,
            showConfirmButton: false
          });
          
    });
  });
});

simplyCountdown('#cuentaRegresiva', {
    year: 2025, // required
    month: 9, // required
    day: 14, // required
    hours: 7, // Default is 0 [0-23] integer
    minutes: 0, // Default is 0 [0-59] integer
    seconds: 0, // Default is 0 [0-59] integer
    words: { //words displayed into the countdown
        days: { singular: 'Día', plural: 'Días' },
        hours: { singular: 'Hrs', plural: 'Hrs' },
        minutes: { singular: 'Min', plural: 'Min' },
        seconds: { singular: 'Seg', plural: 'Seg' }
    },
    plural: true, //use plurals
    inline: false, //set to true to get an inline basic countdown like : 24 days, 4 hours, 2 minutes, 5 seconds
    inlineClass: 'simply-countdown-inline', //inline css span class in case of inline = true
    // in case of inline set to false
    enableUtc: false, //Use UTC or not - default : false
    onEnd: function() { return; }, //Callback on countdown end, put your own function here
    refresh: 1000, // default refresh every 1s
    sectionClass: 'simply-section', //section css class
    amountClass: 'simply-amount', // amount css class
    wordClass: 'simply-word', // word css class
    zeroPad: false,
    countUp: false
});

simplyCountdown('#cuentaRegresiva2', {
    year: 2025, // required
    month: 9, // required
    day: 28, // required
    hours: 7, // Default is 0 [0-23] integer
    minutes: 0, // Default is 0 [0-59] integer
    seconds: 0, // Default is 0 [0-59] integer
    words: { //words displayed into the countdown
        days: { singular: 'Día', plural: 'Días' },
        hours: { singular: 'Hrs', plural: 'Hrs' },
        minutes: { singular: 'Min', plural: 'Min' },
        seconds: { singular: 'Seg', plural: 'Seg' }
    },
    plural: true, //use plurals
    inline: false, //set to true to get an inline basic countdown like : 24 days, 4 hours, 2 minutes, 5 seconds
    inlineClass: 'simply-countdown-inline', //inline css span class in case of inline = true
    // in case of inline set to false
    enableUtc: false, //Use UTC or not - default : false
    onEnd: function() { return; }, //Callback on countdown end, put your own function here
    refresh: 1000, // default refresh every 1s
    sectionClass: 'simply-section', //section css class
    amountClass: 'simply-amount', // amount css class
    wordClass: 'simply-word', // word css class
    zeroPad: false,
    countUp: false
});