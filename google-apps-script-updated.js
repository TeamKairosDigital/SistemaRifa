// ================================
// CONFIGURACIÓN FIREBASE / SHEETS
// ================================
const API_KEY = 'AIzaSyBb9UPKIqoTTB68H2J-JXozbWzu1kUOlS8';
const PROJECT_ID = 'rifa-con-causa-tayson';
const COLLECTION_NAME = 'rifas';

// ================================
// FUNCIÓN: obtener datos Firestore
// ================================
function getFirestoreData() {
  const rifas = ['rifa1','rifa2','rifa3'];
  let allData = {};

  rifas.forEach(function(rifa) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}/${rifa}?key=${API_KEY}`;
    try {
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      if (data.fields) {
        allData[rifa] = data.fields;
      } else {
        Logger.log(`La rifa ${rifa} no tiene datos en Firestore.`);
      }
    } catch (error) {
      Logger.log(`Error al obtener datos de ${rifa}: ${error}`);
    }
  });

  return allData;
}

// ================================
// FUNCIÓN: escribir en la hoja
// ================================
function writeToSheet() {
  const sheet = SpreadsheetApp.openById("1aDn1PTCFD2WjdQXFPh8VJOo8e3udNhDyUKpgQ2qAS_Q");

  // Obtiene los datos de Firestore
  const data = getFirestoreData();

  // Definir los límites de cada rifa
  const rifaLimits = {
    rifa1: 80,
    rifa2: 80,
    rifa3: 80
  };

  for (const rifa in rifaLimits) {
    const limit = rifaLimits[rifa];
    const rifaData = data[rifa] || {};

    // Crear hoja si no existe
    let sheetRifa = sheet.getSheetByName(rifa);
    if (!sheetRifa) {
      sheetRifa = sheet.insertSheet(rifa);
      sheetRifa.appendRow(['Numero', 'Nombre', 'Telefono', 'Tipo de Pago', 'Estado', 'Pago']);
    }

    // Obtener datos existentes en la hoja
    let existingData = sheetRifa.getDataRange().getValues();
    let existingMap = new Map(); // (Número, fila)

    for (let i = 1; i < existingData.length; i++) {
      existingMap.set(existingData[i][0], i + 1); // fila en hoja
    }

    let rowsToInsert = []; // filas nuevas
    let allColors = [];    // colores fila por fila
    let allFontColors = [];  // Colores de texto

    for (let id = 1; id <= limit; id++) {
      const entry = (rifaData[id] && rifaData[id].mapValue) 
        ? rifaData[id].mapValue.fields 
        : {};

      const nombre = entry.nombre ? entry.nombre.stringValue : "";
      const telefono = entry.numero ? entry.numero.stringValue : "";
      const tipoPago = entry.tipoPago ? entry.tipoPago.stringValue : "";
      const pago = entry.pago ? entry.pago.booleanValue : false;

      let estado = "";
      if (nombre && telefono) {
        estado = pago ? "Ocupado" : "Pendiente";
      }

      let pagoTexto = "";
      if (nombre && telefono) {
        pagoTexto = pago ? "Pagado" : "Pendiente";
      }

      let tipoPagoTexto = "";
      if (tipoPago) {
        tipoPagoTexto = tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo';
      }

      const newRow = [id, nombre, telefono, tipoPagoTexto, estado, pagoTexto];

      if (existingMap.has(id)) {
        // Actualizar fila existente
        let rowIndex = existingMap.get(id);
        sheetRifa.getRange(rowIndex, 1, 1, 6).setValues([newRow]);
      } else {
        // Insertar nueva fila
        rowsToInsert.push(newRow);
      }

      // Colores de fondo y texto
      let bgColor, fontColor;

      if (!nombre && !telefono) {
        bgColor = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]; // Disponible
        fontColor = ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"];
      } else if (pago) {
        bgColor = ["#ef476f", "#ef476f", "#ef476f", "#ef476f", "#ef476f", "#ef476f"]; // Ocupado y Pagado
        fontColor = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]; // Texto en blanco
      } else {
        bgColor = ["#ffd23f", "#ffd23f", "#ffd23f", "#ffd23f", "#ffd23f", "#ffd23f"]; // Pendiente de pago
        fontColor = ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]; // Texto negro
      }

      allColors.push(bgColor);
      allFontColors.push(fontColor);
    }

    // Insertar filas nuevas al final
    if (rowsToInsert.length > 0) {
      sheetRifa.getRange(sheetRifa.getLastRow() + 1, 1, rowsToInsert.length, 6).setValues(rowsToInsert);
    }

    // Ordenar por número
    let allData = sheetRifa.getDataRange().getValues().slice(1); // sin cabecera
    allData.sort((a, b) => a[0] - b[0]);
    sheetRifa.getRange(2, 1, allData.length, 6).setValues(allData);

    // Aplicar colores
    sheetRifa.getRange(2, 1, limit, 6).setBackgrounds(allColors);
    
    // Aplicar colores de texto
    sheetRifa.getRange(2, 1, limit, 6).setFontColors(allFontColors);
  }
}

// ================================
// FUNCIÓN: configurar headers CORS
// ================================
function setCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

// ================================
// FUNCIONES WEB (endpoint REST)
// ================================
function doPost(e) {
  try {
    writeToSheet();
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: "ok", 
        message: "Datos escritos en Google Sheets",
        timestamp: new Date().toISOString()
      })
    )
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(setCORSHeaders());
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: "error", 
        message: err.message,
        timestamp: new Date().toISOString()
      })
    )
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(setCORSHeaders());
  }
}

function doGet(e) {
  return doPost(e);
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setHeaders(setCORSHeaders());
}
