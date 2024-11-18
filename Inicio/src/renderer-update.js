const { ipcRenderer } = require('electron');

// Formatear fechas a "YYYY-MM-DD"
function formatDate(dateString) {
  if (!dateString) return ""; // Manejar fechas nulas o indefinidas
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Escuchar datos enviados para actualizar el proyecto
ipcRenderer.on('update-project-data', (event, projectData) => {
  document.getElementById('nombre').value = projectData.name;
  document.getElementById('descripcion').value = projectData.description;
  document.getElementById('fecha_inicio').value = formatDate(projectData.startDate);
  document.getElementById('fecha_termino').value = formatDate(projectData.endDate);
});

// Manejar envío del formulario de actualización
document.getElementById('update-project-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const updatedProject = {
    name: document.getElementById('nombre').value,
    description: document.getElementById('descripcion').value,
    startDate: document.getElementById('fecha_inicio').value,
    endDate: document.getElementById('fecha_termino').value,
  };

  ipcRenderer.send('update-project', updatedProject);
});

