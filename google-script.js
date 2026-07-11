/**
 * Google Apps Script para registrar visitas con imagen incrustada DENTRO de la celda.
 *
 * ⚠️ COPIA TODO ESTE CÓDIGO EN TU APPS SCRIPT Y GENERA UNA NUEVA VERSIÓN.
 *
 * Instrucciones:
 * 1. En tu Google Sheet, ve a Extensiones > Apps Script.
 * 2. Borra TODO el código existente y pega este código completo.
 * 3. Guarda (Ctrl+S).
 * 4. Implementar > Gestionar implementaciones > Editar (lápiz) > Nueva versión > Implementar.
 * 5. Ejecutar como: "Tú"  |  Acceso: "Cualquiera".
 * 6. Si pide autorizar permisos, acéptalos todos.
 */

function doPost(e) {
  try {
    // Leer el body. El formulario envía Content-Type: text/plain con JSON como cuerpo.
    var rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : null;

    if (!rawBody) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No se recibió ningún dato."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(rawBody);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Crear encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Fecha Visita",
        "Persona que realiza la visita",
        "Lugar",
        "Gerente de Zona",
        "Canal",
        "Línea",
        "Clientes / Razón Social",
        "Pilar",
        "Marca",
        "Actividad",
        "Observaciones",
        "Apoyo aliado (Sí/No)",
        "Quién (Apoyo aliado)",
        "Apoyo especialista (Sí/No)",
        "Quién (Apoyo especialista)",
        "Apoyo Gerente de Zona (Sí/No)",
        "Quién (Apoyo Gerente de Zona)",
        "Evidencia Fotográfica",
        "Fecha de Registro (Sistema)",
        "Asignación Económica (Sí/No)",
        "Gasto/Costo"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
           .setFontWeight("bold")
           .setBackground("#002855")
           .setFontColor("#ffffff");
    }

    // Fila donde irá el nuevo registro
    var nextRow = sheet.getLastRow() + 1;

    // Armar fila de datos (columna 18 vacía: se llenará con la imagen)
    var row = [
      data.fecha                      || "",
      data.persona                    || "",
      data.lugar                      || "",
      data.zona                       || "",
      data.canal                      || "",
      data.linea                      || "",
      data.razon_social               || "",
      data.pilar                      || "",
      data.marca                      || "",
      data.actividad                  || "",
      data.observaciones              || "",
      data.apoyo_aliado               || "",
      data.apoyo_aliado_quien         || "",
      data.apoyo_especialista         || "",
      data.apoyo_especialista_quien   || "",
      data.apoyo_gerente_zona         || "",
      data.apoyo_gerente_zona_quien   || "",
      "",                               // Col 18: imagen (se inserta abajo)
      new Date().toISOString(),         // Col 19: timestamp del sistema
      data.asignacion_economica       || "No",
      data.gasto_costo                || ""
    ];

    sheet.appendRow(row);

    // Insertar imagen DENTRO de la celda usando CellImageBuilder
    if (data.fotoBase64 && data.fotoBase64.length > 10) {
      var mimeType = "image/jpeg";
      if (data.fotoNombre && data.fotoNombre.toLowerCase().endsWith(".png")) {
        mimeType = "image/png";
      }

      // Construir data URL para CellImageBuilder
      var dataUrl = "data:" + mimeType + ";base64," + data.fotoBase64;

      // Crear imagen incrustada directamente DENTRO de la celda
      var cellImage = SpreadsheetApp.newCellImage()
          .setSourceUrl(dataUrl)
          .setAltTextTitle("Evidencia Fotográfica")
          .setAltTextDescription("Registro: " + (data.fecha || "") + " - " + (data.persona || ""))
          .build();

      // Ajustar alto de fila para que la imagen se aprecie bien
      sheet.setRowHeight(nextRow, 100);
      sheet.setColumnWidth(18, 140);

      // Incrustar imagen dentro de la celda de la columna 18
      sheet.getRange(nextRow, 18).setValue(cellImage);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registro guardado con imagen incrustada en la celda."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Responder preflight CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
