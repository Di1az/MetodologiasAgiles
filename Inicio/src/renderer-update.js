const { ipcRenderer } = require('electron');

ipcRenderer.on('update-project-data', (event, projectData) => {
  document.getElementById('nombre').value = projectData.name;
  document.getElementById('descripcion').value = projectData.description;
  document.getElementById('fecha_inicio').value = projectData.startDate;
  document.getElementById('fecha_termino').value = projectData.endDate;
});

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
