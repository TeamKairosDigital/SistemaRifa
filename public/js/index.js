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

const telefonoInput = document.getElementById("telefono");

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

        let cantidadNumeros = 50;
        // if(rifaSeleccionada == 'rifa4'){
        //     cantidadNumeros = 50;
        // }else{
        //     cantidadNumeros = 100;
        // }

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
    const name = document.getElementById("nombre")
    console.log(telefonoInput.value.length);
    if (selectedNumbers.length > 0 && name.value.length > 0) {
        boton.disabled = false;
    } else {
        boton.disabled = true;
    }
}

function textRifa(){
    switch (document.getElementById("rifaSelect").value) {
            case "rifa1":
                return "Collar de acero inoxidable";
            case "rifa2":
                return "Perfume de caballero";
            // case "rifa3":
            //     return "Diseño Gratis";
            // case "rifa4":
            //     return " Cena para 2 personas";
    }
}

function enviarWhatsApp() {

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const rifaSeleccionada = textRifa();
    const numeros = Array.from(document.querySelectorAll(".number.selected")).map(el => el.textContent).join(", ");

    const cantidadBoletos = Array.from(document.querySelectorAll(".number.selected")).length;
    const total = cantidadBoletos * 25;

    const mensaje = `Hola, soy ${nombre}.\n\nQuiero participar en la Rifa: ${rifaSeleccionada}.\n\n- Mi número de WhatsApp es: ${telefono}.\n\n- Mis números seleccionados son: ${numeros}\n\n- El total a pagar es de: $${total} pesos`;

    const url = `https://wa.me/+529611983460?text=${encodeURIComponent(mensaje)}`;
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
    month: 5, // required
    day: 30, // required
    hours: 14, // Default is 0 [0-23] integer
    minutes: 30, // Default is 0 [0-59] integer
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