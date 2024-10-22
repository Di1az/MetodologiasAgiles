const { ipcRenderer } = require('electron');

// Abrir ventana para agregar nuevo proyecto
document.getElementById('newProjectBtn').addEventListener('click', () => {
  ipcRenderer.send('open-new-project-window');
});

// Mostrar el nuevo proyecto en la interfaz principal
ipcRenderer.on('new-project', (event, projectData) => {
  const projectContainer = document.getElementById('projectsContainer');
  const projectCard = createProjectCard(projectData);
  projectContainer.appendChild(projectCard);
});

// Escuchar evento de clic en el botón de editar proyecto
function createProjectCard(projectData) {
  const projectCard = document.createElement('div');
  projectCard.classList.add('project-card');
  
  projectCard.innerHTML = `
    <h3>${projectData.name}</h3>
    <p>Descripción: ${projectData.description}</p>
    <p>Fecha de Inicio: ${projectData.startDate}</p>
    <p>Fecha Final: ${projectData.endDate}</p>
    <button class="edit-btn">Editar Proyecto</button>
  `;
  
  // Evento de clic para editar el proyecto
  projectCard.querySelector('.edit-btn').addEventListener('click', () => {
    ipcRenderer.send('open-edit-project-window', projectData);
    
  });

  return projectCard;
}

// Recibir datos del proyecto a editar
ipcRenderer.on('update-project-data', (event, projectData) => {
  win.loadfile("update-project.html");
  console.log("aaaa");
  console.log(projectData);
  document.getElementById('nombre').value = projectData.name;
  document.getElementById('descripcion').value = projectData.description;
  document.getElementById('fecha_inicio').value = projectData.startDate;
  document.getElementById('fecha_termino').value = projectData.endDate;
});

// Enviar proyecto actualizado al proceso principal
document.getElementById('update-project-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const updatedProject = {
    name: document.getElementById('nombre').value,
    description: document.getElementById('descripcion').value,
    startDate: document.getElementById('fecha_inicio').value,
    endDate: document.getElementById('fecha_termino').value,
  };

  ipcRenderer.send('update-project', updatedProject);


});
