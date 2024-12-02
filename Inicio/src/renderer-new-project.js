const { ipcRenderer } = require('electron');

// Expresiones regulares para validar los campos
const nameRegex = /^[a-zA-Z0-9\s]{3,50}$/; // Solo letras, números y espacios, entre 3 y 50 caracteres
const descriptionRegex = /^.{10,200}$/;    // Cualquier texto entre 10 y 200 caracteres

    // Guardar el proyecto con descripción y fechas
    document.getElementById('projectForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Capturar valores de los campos
    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Referencia al contenedor de mensajes de error
  const errorMessages = document.getElementById('errorMessages');
  errorMessages.innerHTML = ''; // Limpiar mensajes previos

  // Validar que todos los campos estén llenos
  if (!name || !description || !startDate || !endDate) {
    errorMessages.innerHTML = 'Todos los campos son obligatorios. Por favor, complétalos.';
    focusFirstEmptyField(name, description, startDate, endDate);
    return;
  }

  // Validaciones específicas
  if (!nameRegex.test(name)) {
    errorMessages.innerHTML = 'El nombre del proyecto debe tener entre 3 y 50 caracteres, y solo puede contener letras, números y espacios.';
    document.getElementById('name').focus();
    return;
  }

  if (!descriptionRegex.test(description)) {
    errorMessages.innerHTML = 'La descripción debe tener entre 10 y 200 caracteres.';
    document.getElementById('description').focus();
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    errorMessages.innerHTML = 'La fecha de inicio no puede ser posterior a la fecha final.';
    document.getElementById('startDate').focus();
    return;
  }

    // Si todo es válido, enviar los datos al proceso principal
    const projectData = { name, description, startDate, endDate };
    ipcRenderer.send('add-project', projectData);
});   

    // Botón de cerrar
    document.getElementById('closeBtn').addEventListener('click', () => {
    ipcRenderer.send('close-window');
    });

    // Función para enfocar el primer campo vacío
function focusFirstEmptyField(name, description, startDate, endDate) {
    if (!name) {
      document.getElementById('name').focus();
    } else if (!description) {
      document.getElementById('description').focus();
    } else if (!startDate) {
      document.getElementById('startDate').focus();
    } else if (!endDate) {
      document.getElementById('endDate').focus();
    }
  }