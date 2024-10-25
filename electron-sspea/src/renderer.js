const { ipcRenderer } = require('electron');

// Abrir ventana para agregar nuevo proyecto
document.getElementById('newProjectBtn').addEventListener('click', () => {
  ipcRenderer.send('open-new-project-window');
});

// Mostrar el nuevo proyecto en la interfaz principal
ipcRenderer.on('new-project', (event, projectData) => {
  // CAMBIAR FETCH POR APIGATEWAY EN FUTURAS VERSIONES
  //
  console.log(projectData,'data del proy');
  fetch('http://localhost:3000/proyectos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: projectData.name,
      descripcion: projectData.description,
      fecha_inicio: projectData.endDate,
      fecha_termino: projectData.startDate
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Fallo al crear el proyecto');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Proyecto creado:', data);

      // crear card después de crear proyecto
      const projectContainer = document.getElementById('projectsContainer');
      const projectCard = createProjectCard(projectData);
      projectContainer.appendChild(projectCard);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

//Escuchar evento de clic en el botón de editar proyecto
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
  
  
  projectCard.querySelector('.edit-btn').addEventListener('click', () => {
    // Asegurarte de que los datos actuales del proyecto se envíen correctamente al abrir la ventana de edición
    const updatedProjectData = JSON.parse(projectCard.dataset.projectData || JSON.stringify(projectData));
    ipcRenderer.send('open-edit-project-window', updatedProjectData);
  });

  return projectCard;
}

// Escuchar cuando un proyecto es actualizado
ipcRenderer.on('project-updated', (event, updatedProjectData) => {
  console.log("Proyecto actualizado recibido:", updatedProjectData);
  
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    const projectName = card.querySelector('h3').textContent;
    
    if (projectName === updatedProjectData.name) {
      // Actualiza los datos de la tarjeta del proyecto
      card.querySelector('p:nth-of-type(1)').textContent = `Descripción: ${updatedProjectData.description}`;
      card.querySelector('p:nth-of-type(2)').textContent = `Fecha de Inicio: ${updatedProjectData.startDate}`;
      card.querySelector('p:nth-of-type(3)').textContent = `Fecha Final: ${updatedProjectData.endDate}`;
      
      // Actualizar la referencia al objeto `projectData` en la tarjeta
      card.dataset.projectData = JSON.stringify(updatedProjectData);
    }
  });
});

