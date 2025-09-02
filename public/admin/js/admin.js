import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

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
const auth = getAuth(app);

let currentRifa = 'rifa1';
let rifaData = {};

// Elementos del DOM
const rifaTabs = document.querySelectorAll('[id$="-tab"]');
const rifaContents = document.querySelectorAll('.rifa-content');
const refreshBtn = document.getElementById('refreshBtn');

// Verificación de autenticación
function verificarAutenticacion() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('No autenticado'));
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificar autenticación antes de cargar el panel
        await verificarAutenticacion();
        
        // Agregar botón de logout al header
        agregarBotonLogout();
        
        setupEventListeners();
        setupEditModalListeners();
        loadRifaData();
    } catch (error) {
        console.error('Usuario no autenticado:', error);
        // Redirigir al login si no está autenticado
        window.location.href = 'index.html';
    }
});

function agregarBotonLogout() {
    const header = document.querySelector('.d-flex.justify-content-between');
    if (header) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline-danger btn-sm ms-2';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
        logoutBtn.onclick = async () => {
            try {
                await signOut(auth);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        };
        
        const btnGroup = header.querySelector('.btn-group');
        if (btnGroup) {
            btnGroup.appendChild(logoutBtn);
        }
    }
}

function setupEventListeners() {
    // Tabs de navegación
    rifaTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetRifa = tab.id.replace('-tab', '');
            showRifaContent(targetRifa);
        });
    });

    // Botón de actualizar
    refreshBtn.addEventListener('click', loadRifaData);
    
    // Botón de sidebar móvil
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Event listeners para filtros de rifas
    setupFilterListeners();
    
    // Event listeners para filtros del resumen
    setupResumenFilterListeners();
}

// Función para alternar sidebar en móviles
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

// Configurar event listeners para filtros de rifas
function setupFilterListeners() {
    const rifas = ['rifa1', 'rifa2', 'rifa3'];
    
    rifas.forEach(rifa => {
        // Filtro por estado
        const estadoFilter = document.getElementById(`${rifa}-estado-filter`);
        if (estadoFilter) {
            estadoFilter.addEventListener('change', () => applyTableFilters(rifa));
        }
        
        // Filtro por tipo de pago
        const pagoFilter = document.getElementById(`${rifa}-pago-filter`);
        if (pagoFilter) {
            pagoFilter.addEventListener('change', () => applyTableFilters(rifa));
        }
        
        // Filtro de búsqueda
        const searchFilter = document.getElementById(`${rifa}-search`);
        if (searchFilter) {
            searchFilter.addEventListener('input', () => applyTableFilters(rifa));
        }
    });
}

// Configurar event listeners para filtros del resumen
function setupResumenFilterListeners() {
    // Filtros de transferencias
    const transferenciasSearch = document.getElementById('transferencias-search');
    const transferenciasRifa = document.getElementById('transferencias-rifa-filter');
    
    if (transferenciasSearch) {
        transferenciasSearch.addEventListener('input', applyResumenFilters);
    }
    if (transferenciasRifa) {
        transferenciasRifa.addEventListener('change', applyResumenFilters);
    }
    
    // Filtros de efectivo
    const efectivoSearch = document.getElementById('efectivo-search');
    const efectivoRifa = document.getElementById('efectivo-rifa-filter');
    
    if (efectivoSearch) {
        efectivoSearch.addEventListener('input', applyResumenFilters);
    }
    if (efectivoRifa) {
        efectivoRifa.addEventListener('change', applyResumenFilters);
    }
}

function showRifaContent(rifa) {
    // Actualizar tabs activos
    rifaTabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${rifa}-tab`).classList.add('active');

    // Mostrar contenido correspondiente
    rifaContents.forEach(content => content.style.display = 'none');
    document.getElementById(`${rifa}-content`).style.display = 'block';

    currentRifa = rifa;
    if (rifa === 'resumen') {
        loadResumenData();
    } else {
        displayRifaTable(rifa);
    }
}

async function loadRifaData() {
    try {
        const rifas = ['rifa1', 'rifa2', 'rifa3'];
        
        for (const rifa of rifas) {
            const docRef = doc(db, "rifas", rifa);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                rifaData[rifa] = docSnap.data();
            } else {
                rifaData[rifa] = {};
            }
        }

        // Mostrar datos de la rifa actual
        if (currentRifa === 'resumen') {
            loadResumenData();
        } else {
            displayRifaTable(currentRifa);
        }

        Swal.fire({
            icon: 'success',
            title: 'Datos actualizados',
            text: 'La información se ha actualizado correctamente',
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los datos'
        });
    }
}

function displayRifaTable(rifa) {
    const tableBody = document.getElementById(`${rifa}-table`);
    tableBody.innerHTML = '';

    let totalParticipantes = 0;
    let totalPendientes = 0;
    let totalPagados = 0;

    for (let i = 1; i <= 80; i++) {
        const row = document.createElement('tr');
        const data = rifaData[rifa][i] || {};

        const nombre = data.nombre || '';
        const telefono = data.numero || '';
        const tipoPago = data.tipoPago || '';
        const pago = data.pago || false;
        const ocupado = data.ocupado || false;
        const fechaReserva = formatDate(data.fechaReserva) || '';

        // Contar estadísticas
        if (nombre && telefono) {
            totalParticipantes++;
            if (pago) {
                totalPagados++;
            } else {
                totalPendientes++;
            }
        }

        let estado = '';
        if (nombre && telefono) {
            if (pago) {
                estado = '<span class="badge bg-success">Pagado</span>';
            } else {
                estado = '<span class="badge bg-warning">Pendiente</span>';
            }
        } else {
            estado = '<span class="badge bg-secondary">Disponible</span>';
        }

        let tipoPagoTexto = tipoPago ? 
            (tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo') : '';

        row.innerHTML = `
            <td>${i}</td>
            <td>${nombre}</td>
            <td>${telefono}</td>
            <td>${tipoPagoTexto}</td>
            <td>${fechaReserva}</td>
            <td>${estado}</td>
            <td>
                <div class="btn-group" role="group">
                    ${nombre && telefono ? 
                        `<button class="btn btn-sm btn-outline-primary" onclick="editarParticipante('${rifa}', ${i})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>` : 
                        ''
                    }
                    ${nombre && telefono && !pago ? 
                        `<button class="btn btn-sm btn-success" onclick="confirmarPago('${rifa}', ${i}, '${nombre}', '${tipoPago}')" title="Confirmar Pago">
                            <i class="fas fa-check"></i>
                        </button>` : 
                        (nombre && telefono && pago ? 
                            '<span class="text-success"><i class="fas fa-check-circle"></i></span>' : 
                            '')
                    }
                </div>
            </td>
        `;

        // Aplicar colores según el estado
        if (nombre && telefono) {
            if (pago) {
                row.classList.add('table-success');
            } else {
                row.classList.add('table-warning');
            }
        }

        tableBody.appendChild(row);
    }

    // Actualizar contadores
    updateRifaCounters(rifa, totalParticipantes, totalPendientes, totalPagados);
}

function formatDate(date) {
    if (!date) return ''; // si es null, undefined o vacío

    const fecha = new Date(date);
    if (isNaN(fecha.getTime())) return ''; // si no es una fecha válida

    return fecha.toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Mexico_City"
    });
}

function loadResumenData() {
    const rifas = ['rifa1', 'rifa2', 'rifa3'];
    let totalTransferencias = 0;
    let totalEfectivo = 0;
    let totalPendientes = 0;
    let transferenciasData = [];
    let efectivoData = [];

    rifas.forEach(rifa => {
        let rifaTransferencias = 0;
        let rifaEfectivo = 0;

        // Procesar datos de la rifa
        Object.keys(rifaData[rifa]).forEach(numero => {
            const data = rifaData[rifa][numero];
            if (data.nombre && data.numero) {
                if (data.pago) {
                    const monto = 50; // $50 por boleto
                    
                    if (data.tipoPago === 'transferencia') {
                        rifaTransferencias += monto;
                        totalTransferencias += monto;
                        transferenciasData.push({
                            rifa: getRifaNombre(rifa),
                            nombre: data.nombre,
                            numeros: numero,
                            monto: monto
                        });
                    } else if (data.tipoPago === 'efectivo') {
                        rifaEfectivo += monto;
                        totalEfectivo += monto;
                        efectivoData.push({
                            rifa: getRifaNombre(rifa),
                            nombre: data.nombre,
                            numeros: numero,
                            monto: monto
                        });
                    }
                } else {
                    // Contar pendientes
                    totalPendientes++;
                }
            }
        });

        // Actualizar resumen por rifa
        document.getElementById(`${rifa}-transferencias`).textContent = `$${rifaTransferencias}`;
        document.getElementById(`${rifa}-efectivo`).textContent = `$${rifaEfectivo}`;
        document.getElementById(`${rifa}-total`).textContent = `$${rifaTransferencias + rifaEfectivo}`;
    });

    // Actualizar totales generales
    document.getElementById('total-transferencias').textContent = `$${totalTransferencias}`;
    document.getElementById('total-efectivo').textContent = `$${totalEfectivo}`;
    document.getElementById('total-pendientes').textContent = totalPendientes;

    // Actualizar tablas de participantes
    updateParticipantesTable('transferencias-table', transferenciasData);
    updateParticipantesTable('efectivo-table', efectivoData);
}

function updateParticipantesTable(tableId, data) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.rifa}</td>
            <td>${item.nombre}</td>
            <td>${item.numeros}</td>
            <td>$${item.monto}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getRifaNombre(rifa) {
    const nombres = {
        'rifa1': 'Carnitas',
        'rifa2': 'Pastel',
        'rifa3': 'Fotos'
    };
    return nombres[rifa] || rifa;
}

// Función global para confirmar pago
window.confirmarPago = async function(rifa, numero, nombre, tipoPago) {
    // Mostrar modal de confirmación
    document.getElementById('modal-nombre').textContent = nombre;
    document.getElementById('modal-numeros').textContent = numero;
    document.getElementById('modal-tipo-pago').textContent = tipoPago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo';

    const modal = new bootstrap.Modal(document.getElementById('confirmarPagoModal'));
    modal.show();

    // Configurar botón de confirmación
    document.getElementById('confirmarPagoBtn').onclick = async () => {
        try {
            // Mostrar spinner
            mostrarSpinner();
            
            const docRef = doc(db, "rifas", rifa);
            const docSnap = await getDoc(docRef);
            let datosActuales = docSnap.exists() ? docSnap.data() : {};

            // Actualizar estado de pago
            if (datosActuales[numero]) {
                datosActuales[numero].pago = true;
                datosActuales[numero].ocupado = true;
                datosActuales[numero].fechaPago = new Date().toISOString();

                await updateDoc(docRef, datosActuales);

                // Actualizar datos locales
                rifaData[rifa][numero] = datosActuales[numero];

                // Actualizar tabla
                displayRifaTable(rifa);

                // Actualizar Google Sheets
                await actualizarGoogleSheets();

                modal.hide();

                // Ocultar spinner
                ocultarSpinner();

                Swal.fire({
                    icon: 'success',
                    title: 'Pago Confirmado',
                    text: `El pago de ${nombre} ha sido confirmado exitosamente`,
                    timer: 2000,
                    showConfirmButton: false
                });

            } else {
                throw new Error('No se encontró el registro');
            }

        } catch (error) {
            console.error("Error al confirmar pago:", error);
            
            // Ocultar spinner en caso de error
            ocultarSpinner();
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo confirmar el pago'
            });
        }
    };
};

// Funciones helper para el spinner
function mostrarSpinner() {
    document.getElementById('spinner').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

// Función para actualizar Google Sheets
async function actualizarGoogleSheets() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxeVwGT4i51ThlV0b6NHyOrdFG69lrVLyC11amxDUBeFavIJLKLUImQVoTg-DjRr06x/exec', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Google Sheets actualizado:', data);
            
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Google Sheets Actualizado',
                text: 'Los datos se han sincronizado correctamente con Google Sheets',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            console.error('Error al actualizar Google Sheets:', response.status);
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('Error al actualizar Google Sheets:', error);
        
        // Mostrar mensaje de error más informativo
        Swal.fire({
            icon: 'warning',
            title: 'Error de Sincronización',
            text: 'No se pudo sincronizar con Google Sheets. Los datos locales se han guardado correctamente.',
            confirmButtonText: 'Entendido'
        });
    }
}

// Variables globales para edición
let participanteEditando = null;
let rifaEditando = null;

// Función global para editar participante
window.editarParticipante = function(rifa, numero) {
    const data = rifaData[rifa][numero];
    if (!data) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el participante'
        });
        return;
    }

    // Guardar datos para edición
    participanteEditando = numero;
    rifaEditando = rifa;

    // Llenar el formulario
    document.getElementById('edit-numero').value = numero;
    document.getElementById('edit-nombre').value = data.nombre || '';
    document.getElementById('edit-telefono').value = data.numero || '';
    document.getElementById('edit-tipo-pago').value = data.tipoPago || '';
    document.getElementById('edit-estado-pago').value = data.pago ? 'true' : 'false';

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('editarParticipanteModal'));
    modal.show();
};

// Event listeners para el modal de edición (se configuran cuando se carga el DOM)
function setupEditModalListeners() {
    // Botón guardar cambios
    const guardarBtn = document.getElementById('guardarCambiosBtn');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', guardarCambiosParticipante);
    }
    
    // Botón eliminar participante
    const eliminarBtn = document.getElementById('eliminarParticipanteBtn');
    if (eliminarBtn) {
        eliminarBtn.addEventListener('click', eliminarParticipante);
    }
}

// Función para actualizar contadores de rifa
function updateRifaCounters(rifa, total, pendientes, pagados) {
    const totalElement = document.getElementById(`${rifa}-total-participantes`);
    const pendientesElement = document.getElementById(`${rifa}-pendientes`);
    const pagadosElement = document.getElementById(`${rifa}-pagados`);
    
    if (totalElement) totalElement.textContent = total;
    if (pendientesElement) pendientesElement.textContent = pendientes;
    if (pagadosElement) pagadosElement.textContent = pagados;
}

// Función para aplicar filtros a una tabla
function applyTableFilters(rifa) {
    const estadoFilter = document.getElementById(`${rifa}-estado-filter`).value;
    const pagoFilter = document.getElementById(`${rifa}-pago-filter`).value;
    const searchFilter = document.getElementById(`${rifa}-search`).value.toLowerCase();
    
    const tableBody = document.getElementById(`${rifa}-table`);
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const nombre = row.cells[1].textContent.toLowerCase();
        const telefono = row.cells[2].textContent.toLowerCase();
        const tipoPago = row.cells[3].textContent.toLowerCase();
        const estado = row.cells[4].textContent.toLowerCase();
        
        let showRow = true;
        
        // Filtro por estado
        if (estadoFilter) {
            if (estadoFilter === 'disponible' && !nombre) {
                showRow = true;
            } else if (estadoFilter === 'pendiente' && estado.includes('pendiente')) {
                showRow = true;
            } else if (estadoFilter === 'pagado' && estado.includes('pagado')) {
                showRow = true;
            } else if (estadoFilter !== 'disponible') {
                showRow = false;
            }
        }
        
        // Filtro por tipo de pago
        if (pagoFilter && tipoPago && tipoPago !== pagoFilter.toLowerCase()) {
            showRow = false;
        }
        
        // Filtro de búsqueda
        if (searchFilter && !nombre.includes(searchFilter) && !telefono.includes(searchFilter)) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Función para aplicar filtros a las tablas del resumen
function applyResumenFilters() {
    const transferenciasSearch = document.getElementById('transferencias-search').value.toLowerCase();
    const transferenciasRifa = document.getElementById('transferencias-rifa-filter').value;
    const efectivoSearch = document.getElementById('efectivo-search').value.toLowerCase();
    const efectivoRifa = document.getElementById('efectivo-rifa-filter').value;
    
    // Aplicar filtros a tabla de transferencias
    const transferenciasTable = document.getElementById('transferencias-table');
    if (transferenciasTable) {
        const rows = transferenciasTable.querySelectorAll('tr');
        rows.forEach(row => {
            const rifa = row.cells[0].textContent;
            const nombre = row.cells[1].textContent.toLowerCase();
            const numeros = row.cells[2].textContent;
            const monto = row.cells[3].textContent;
            
            let showRow = true;
            
            if (transferenciasRifa && rifa !== transferenciasRifa) {
                showRow = false;
            }
            
            if (transferenciasSearch && !nombre.includes(transferenciasSearch) && !numeros.includes(transferenciasSearch)) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    // Aplicar filtros a tabla de efectivo
    const efectivoTable = document.getElementById('efectivo-table');
    if (efectivoTable) {
        const rows = efectivoTable.querySelectorAll('tr');
        rows.forEach(row => {
            const rifa = row.cells[0].textContent;
            const nombre = row.cells[1].textContent.toLowerCase();
            const numeros = row.cells[2].textContent;
            const monto = row.cells[3].textContent;
            
            let showRow = true;
            
            if (efectivoRifa && rifa !== efectivoRifa) {
                showRow = false;
            }
            
            if (efectivoSearch && !nombre.includes(efectivoSearch) && !numeros.includes(efectivoSearch)) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
}

// Función para guardar cambios del participante
async function guardarCambiosParticipante() {
    if (!participanteEditando || !rifaEditando) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay participante seleccionado para editar'
        });
        return;
    }

    // Validar formulario
    const nombre = document.getElementById('edit-nombre').value.trim();
    const telefono = document.getElementById('edit-telefono').value.trim();
    const tipoPago = document.getElementById('edit-tipo-pago').value;
    const estadoPago = document.getElementById('edit-estado-pago').value === 'true';

    if (!nombre || !telefono || !tipoPago) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos requeridos',
            text: 'Por favor completa todos los campos'
        });
        return;
    }

    try {
        mostrarSpinner();

        const docRef = doc(db, "rifas", rifaEditando);
        const docSnap = await getDoc(docRef);
        let datosActuales = docSnap.exists() ? docSnap.data() : {};

        // Actualizar datos del participante
        datosActuales[participanteEditando] = {
            ...datosActuales[participanteEditando],
            nombre: nombre,
            numero: telefono,
            tipoPago: tipoPago,
            pago: estadoPago,
            ocupado: estadoPago, // Si está pagado, está ocupado
            fechaModificacion: new Date().toISOString()
        };

        await updateDoc(docRef, datosActuales);

        // Actualizar datos locales
        rifaData[rifaEditando][participanteEditando] = datosActuales[participanteEditando];

        // Actualizar tabla
        displayRifaTable(rifaEditando);

        // Actualizar Google Sheets
        await actualizarGoogleSheets();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editarParticipanteModal'));
        modal.hide();

        ocultarSpinner();

        Swal.fire({
            icon: 'success',
            title: 'Participante Actualizado',
            text: 'Los datos del participante se han actualizado correctamente',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error("Error al actualizar participante:", error);
        ocultarSpinner();
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el participante'
        });
    }
}

// Función para eliminar participante
async function eliminarParticipante() {
    if (!participanteEditando || !rifaEditando) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay participante seleccionado para eliminar'
        });
        return;
    }

    const data = rifaData[rifaEditando][participanteEditando];
    const nombre = data.nombre || 'Participante';

    // Confirmar eliminación
    const result = await Swal.fire({
        title: '¿Eliminar participante?',
        text: `¿Estás seguro de que quieres eliminar a ${nombre} del número ${participanteEditando}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            mostrarSpinner();

            const docRef = doc(db, "rifas", rifaEditando);
            const docSnap = await getDoc(docRef);
            let datosActuales = docSnap.exists() ? docSnap.data() : {};

            // Eliminar el participante (dejar el número disponible)
            delete datosActuales[participanteEditando];

            await setDoc(docRef, datosActuales);

            // Actualizar datos locales
            delete rifaData[rifaEditando][participanteEditando];

            // Actualizar tabla
            displayRifaTable(rifaEditando);

            // Actualizar Google Sheets
            await actualizarGoogleSheets();

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarParticipanteModal'));
            modal.hide();

            ocultarSpinner();

            Swal.fire({
                icon: 'success',
                title: 'Participante Eliminado',
                text: 'El participante ha sido eliminado correctamente',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error al eliminar participante:", error);
            ocultarSpinner();
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el participante'
            });
        }
    }
}