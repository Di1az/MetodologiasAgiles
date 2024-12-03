const { ipcRenderer } = require('electron');

// Expresiones regulares para validar los campos
const nameRegex = /^[a-zA-Z0-9\s]{3,50}$/; // Solo letras, números y espacios, entre 3 y 50 caracteres
const descriptionRegex = /^.{10,200}$/;    // Cualquier texto entre 10 y 200 caracteres

// Obtener referencias a los campos del formulario
const form = document.getElementById("edit-form");
const nameField = document.getElementById("project-name");
const descriptionField = document.getElementById("project-description");
const startDateField = document.getElementById("project-start-date");
const endDateField = document.getElementById("project-end-date");
const errorMessages = document.getElementById('errorMessages');

// Función para enfocar el primer campo vacío
function focusFirstEmptyField(name, description, startDate, endDate) {
  if (!name) {
    nameField.focus();
  } else if (!description) {
    descriptionField.focus();
  } else if (!startDate) {
    startDateField.focus();
  } else if (!endDate) {
    endDateField.focus();
  }
}

ipcRenderer.on('update-project-data', (event, projectData) => {
  // Verificar que los campos del formulario existan antes de asignarles valores
  if (nameField) nameField.value = projectData.name;
  if (descriptionField) descriptionField.value = projectData.description;   

  nameField.value = projectData.name;
  descriptionField.value = projectData.description;

  // Convertir las fechas al formato 'YYYY-MM-DD'
  const formatToInputDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0]; // Devuelve solo la parte de la fecha
  };
  
  if (startDateField) startDateField.value = formatToInputDate(projectData.startDate);
  if (endDateField) endDateField.value = formatToInputDate(projectData.endDate);

  // Asignamos el ID del proyecto a la propiedad `dataset`
  if (form) form.dataset.projectId = projectData.idProyecto;
});

/*
// Escuchar el evento de envío del formulario
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evitar recargar la página

  if (!form.dataset.projectId) {
    console.error("ID del proyecto no encontrado.");
    return; // Evitar continuar si no tenemos el ID
  }

  // Capturar los datos del formulario
  const updatedProjectData = {
      idProyecto: form.dataset.projectId, // Asegúrate de establecer el id en el atributo `data-project-id` del formulario
      name: nameField.value,
      description: descriptionField.value,
      startDate: startDateField.value,
      endDate: endDateField.value,
  };

  // Enviar los datos al proceso principal
  ipcRenderer.send("update-project-request", updatedProjectData);
});
*/

// Validar y enviar los datos al proceso principal
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Capturar valores de los campos
  const name = nameField.value.trim();
  const description = descriptionField.value.trim();
  const startDate = startDateField.value;
  const endDate = endDateField.value;

  // Limpiar mensajes de error previos
  errorMessages.innerHTML = '';

  // Validar que todos los campos estén llenos
  if (!name || !description || !startDate || !endDate) {
    errorMessages.innerHTML = 'Todos los campos son obligatorios. Por favor, complétalos.';
    focusFirstEmptyField(name, description, startDate, endDate);
    return;
  }

  // Validaciones específicas
  if (!nameRegex.test(name)) {
    errorMessages.innerHTML = 'El nombre del proyecto debe tener entre 3 y 50 caracteres, y solo puede contener letras, números y espacios.';
    nameField.focus();
    return;
  }

  if (!descriptionRegex.test(description)) {
    errorMessages.innerHTML = 'La descripción debe tener entre 10 y 200 caracteres.';
    descriptionField.focus();
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    errorMessages.innerHTML = 'La fecha de inicio no puede ser posterior a la fecha final.';
    startDateField.focus();
    return;
  }

  // Si todo es válido, enviar los datos al proceso principal
  const updatedProjectData = {
    idProyecto: form.dataset.projectId,
    name,
    description,
    startDate,
    endDate,
  };

  ipcRenderer.send('update-project-request', updatedProjectData);
});

ipcRenderer.on("update-project-success", (event, updatedProjectData) => {
  alert("Proyecto actualizado con éxito");
  window.close(); // Cierra la ventana de edición
});

ipcRenderer.on("update-project-failure", (event, errorMessage) => {
  alert(`Error al actualizar el proyecto: ${errorMessage}`);
});

// Escuchar el clic del botón de cerrar
document.getElementById('closeBtn').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});




