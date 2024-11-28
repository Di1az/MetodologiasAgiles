const { ipcRenderer } = require('electron');

// Obtener referencias a los campos del formulario
const form = document.getElementById("edit-form");
const nameField = document.getElementById("project-name");
const descriptionField = document.getElementById("project-description");
const startDateField = document.getElementById("project-start-date");
const endDateField = document.getElementById("project-end-date");

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

ipcRenderer.on("update-project-success", (event, updatedProjectData) => {
  alert("Proyecto actualizado con éxito");
  window.close(); // Cierra la ventana de edición
});

ipcRenderer.on("update-project-failure", (event, errorMessage) => {
  alert(`Error al actualizar el proyecto: ${errorMessage}`);
});



