const { ipcRenderer } = require("electron");

// Abrir ventana para agregar nuevo proyecto
document.getElementById("newProjectBtn").addEventListener("click", () => {
  ipcRenderer.send("open-new-project-window");
});

// Mostrar el nuevo proyecto en la interfaz principal
ipcRenderer.on("new-project", (event, projectData) => {
  // CAMBIAR FETCH POR APIGATEWAY EN FUTURAS VERSIONES
  //
  console.log(projectData, "data del proy");
  fetch("http://localhost:3000/proyectos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: projectData.name,
      descripcion: projectData.description,
      fecha_inicio: projectData.startDate,
      fecha_termino: projectData.endDate,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fallo al crear el proyecto");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Proyecto creado:", data);
      // crear card después de crear proyecto
      const projectContainer = document.getElementById("projectsContainer");
      const projectCard = createProjectCard(projectData, data);
      projectContainer.appendChild(projectCard);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

// Función para obtener proyectos de la base de datos y renderizarlos
function loadProjects() {
  fetch("http://localhost:3000/proyectos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fallo al obtener los proyectos");
      }
      return response.json();
    })
    .then((projects) => {
      console.log("Proyectos obtenidos:", projects);
      renderProjects(projects);
    })
    .catch((error) => {
      console.error("Error al cargar proyectos:", error);
    });
}

// Función para renderizar proyectos en el contenedor
function renderProjects(projects) {
  const projectContainer = document.getElementById("projectsContainer");
  projectContainer.innerHTML = ""; // Limpiar proyectos anteriores

  projects.forEach((project) => {
    // Crear la tarjeta del proyecto
    const projectData = {
      idProyecto: project.id_proyecto,
      name: project.nombre,
      description: project.descripcion,
      startDate: project.fecha_inicio,
      endDate: project.fecha_termino,
    };

    const projectCard = createProjectCard(projectData, project);
    projectContainer.appendChild(projectCard);
  });
}

//Escuchar evento de clic en el botón de editar proyecto
function createProjectCard(projectData, data) {
  const projectCard = document.createElement("div");
  projectCard.classList.add("project-card");

  projectCard.innerHTML = `
    <div class="project-title">
    <h3>${projectData.name}</h3>
    <button class="edit-btn">
    <img src="../assets/icons/icons8-editar.svg" alt="Icon">
    Editar Proyecto
    </button>
    <button class="add-act">+ Añadir actividad</button><br>
    <button class="delete-btn">🗑️ Eliminar Proyecto</button>
    </div>
    <p>Descripción: ${projectData.description}</p>
    <p>Fecha de Inicio: ${projectData.startDate}</p>
    <p>Fecha Final: ${projectData.endDate}</p>
    
  `;

  projectCard.querySelector(".add-act").addEventListener("click", () => {
    projectData.idProyecto = data.id_proyecto;
    localStorage.setItem("proy", JSON.stringify(projectData));

    ipcRenderer.send("open-project-view");
  });

  projectCard.querySelector(".edit-btn").addEventListener("click", () => {
    const updatedProjectData = JSON.parse(
      projectCard.dataset.projectData || JSON.stringify(projectData)
    );
    ipcRenderer.send("open-edit-project-window", updatedProjectData);
  });

  // Botón para eliminar proyecto
projectCard.querySelector(".delete-btn").addEventListener("click", () => {
  if (confirm(`¿Seguro que deseas eliminar el proyecto "${projectData.name}"?`)) {
    fetch(`http://localhost:3000/proyectos/${data.id_proyecto}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo eliminar el proyecto");
        }
        console.log("Proyecto eliminado con éxito");
        projectCard.remove(); // Elimina la tarjeta del DOM
      })
      .catch((error) => {
        console.error("Error al eliminar el proyecto:", error);
      });
  }
});

  return projectCard;
}

// Escuchar cuando un proyecto es actualizado
ipcRenderer.on("project-updated", (event, updatedProjectData) => {
  console.log("Proyecto actualizado recibido:", updatedProjectData);

  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    const projectName = card.querySelector("h3").textContent;

    if (projectName === updatedProjectData.name) {
      // Actualiza los datos de la tarjeta del proyecto
      card.querySelector(
        "p:nth-of-type(1)"
      ).textContent = `Descripción: ${updatedProjectData.description}`;
      card.querySelector(
        "p:nth-of-type(2)"
      ).textContent = `Fecha de Inicio: ${updatedProjectData.startDate}`;
      card.querySelector(
        "p:nth-of-type(3)"
      ).textContent = `Fecha Final: ${updatedProjectData.endDate}`;

      // Actualizar la referencia al objeto `projectData` en la tarjeta
      card.dataset.projectData = JSON.stringify(updatedProjectData);
    }
  });
});

// Llamar a loadProjects cuando se cargue la interfaz
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
});




