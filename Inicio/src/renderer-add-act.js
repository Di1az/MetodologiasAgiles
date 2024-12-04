const { ipcRenderer } = require("electron");

// Expresiones regulares para validar los campos
const descriptionRegex = /^.{5,100}$/; // Entre 5 y 100 caracteres
const idRegex = /^[a-zA-Z0-9-]{3,20}$/; // Letras, números y guiones, entre 3 y 20 caracteres
const costRegex = /^[0-9]+(\.[0-9]{1,2})?$/; // Números enteros o decimales con hasta 2 dígitos

ipcRenderer.on("load-state", (event, data) => {
  const select = document.getElementById("status");
  if (select) {
    console.log("le puse el estado", data.estado);
    console.log("id", data.project_id);
    select.value = data.estado;
  }

  document.getElementById("actForm").addEventListener("submit", (event) => {
    event.preventDefault();

    /*
    const activity = JSON.stringify({
      descripcion: document.getElementById("descripcion").value,
      estado: document.getElementById("status").value,
      costo: document.getElementById("cost").value,
      fecha_inicio: document.getElementById("startDate").value,
      fecha_termino: document.getElementById("endDate").value,
      id_responsable: document.getElementById("responsibleId").value,
      id_proyecto: data.project_id
    });
    */
    
    // Capturar valores de los campos
    const descripcion = document.getElementById("descripcion").value.trim();
    const estado = document.getElementById("status").value;
    const costo = document.getElementById("cost").value.trim();
    const fechaInicio = document.getElementById("startDate").value;
    const fechaTermino = document.getElementById("endDate").value;
    const idResponsable = document.getElementById("responsibleId").value.trim();

     // Referencia al contenedor de mensajes de error
    const errorMessages = document.getElementById("errorMessages");
    errorMessages.innerHTML = ""; // Limpiar mensajes previos

    // Validar que todos los campos estén llenos
    if (!descripcion || !estado || !costo || !fechaInicio || !fechaTermino || !idResponsable) {
      errorMessages.innerHTML =
        "Todos los campos son obligatorios. Por favor, complétalos.";
      focusFirstEmptyField(
        descripcion,
        estado,
        costo,
        fechaInicio,
        fechaTermino,
        idResponsable
      );
      return;
    }

  // Validaciones específicas
  if (!descriptionRegex.test(descripcion)) {
    errorMessages.innerHTML = "La descripción debe tener entre 5 y 100 caracteres.";
    document.getElementById("descripcion").focus();
    return;
  }

  if (estado === "") {
    errorMessages.innerHTML = "Debe seleccionar un estado válido.";
    document.getElementById("status").focus();
    return;
  }

  if (!costRegex.test(costo) || parseFloat(costo) <= 0) {
    errorMessages.innerHTML = "El costo debe ser un número positivo, con hasta dos decimales.";
    document.getElementById("cost").focus();
    return;
  }

  if (new Date(fechaInicio) > new Date(fechaTermino)) {
    errorMessages.innerHTML = "La fecha de inicio no puede ser posterior a la fecha final.";
    document.getElementById("startDate").focus();
    return;
  }

  // Si todo es válido, enviar los datos al proceso principal
  const activity = {
    descripcion,
    estado,
    costo: parseFloat(costo),
    fecha_inicio: fechaInicio,
    fecha_termino: fechaTermino,
    id_responsable: idResponsable,
    id_proyecto: data.project_id
  };

    // Validar campos para asegurarse de que los datos son válidos antes de enviar
    fetch("http://localhost:3000/actividades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      //body: activity
      body: JSON.stringify(activity), // Serializar el objeto como JSON
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fallo al crear la actividad");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Actividad creada:", data);
      // Cerrar la ventana después de guardar la actividad
      window.close();
    })
    .catch((error) => {
      errorMessages.innerHTML = "Error al guardar la actividad.";
      console.error("Error:", error);
    });
  });
});

// Botón de cerrar
document.getElementById("closeBtn").addEventListener("click", () => {
  ipcRenderer.send("close-window");
});

// Función para enfocar el primer campo vacío
function focusFirstEmptyField(
  descripcion,
  estado,
  costo,
  fechaInicio,
  fechaTermino,
  idResponsable
) {
  if (!descripcion) {
    document.getElementById("descripcion").focus();
  } else if (!estado) {
    document.getElementById("status").focus();
  } else if (!costo) {
    document.getElementById("cost").focus();
  } else if (!fechaInicio) {
    document.getElementById("startDate").focus();
  } else if (!fechaTermino) {
    document.getElementById("endDate").focus();
  } else if (!idResponsable) {
    document.getElementById("responsibleId").focus();
  }
}
