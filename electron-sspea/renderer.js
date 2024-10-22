const { ipcRenderer } = require('electron');

document.getElementById('newProjectBtn').addEventListener('click', () => {
  ipcRenderer.send('open-new-project-window');
});

ipcRenderer.on('new-project', (event, projectData) => {
  const projectContainer = document.getElementById('projectsContainer');
  const projectCard = document.createElement('div');
  projectCard.classList.add('project-card');
  projectCard.innerHTML = `
    <h3>${projectData.name}</h3>
    <p>Cronograma: ${projectData.schedule}</p>
    <p>Tareas: ${projectData.tasks}</p>
    <p>Costos: ${projectData.costs}</p>
  `;
  projectContainer.appendChild(projectCard);
});
