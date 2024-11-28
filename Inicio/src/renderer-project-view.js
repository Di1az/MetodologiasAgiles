const { ipcRenderer } = require("electron");

window.onload = function () {
    document.getElementById("delete-btn").removeAttribute('click');
};

// Función para cargar las actividades
function loadActivities(projectData) {
    console.log(projectData, "data del proyecto");

    // Actualizar título del proyecto
    document.getElementById("title-project").textContent = projectData.name;

    console.log(projectData.idProyecto);

    renderProjectDetails(projectData);

    // Obtener actividades específicas para este proyecto desde la API
    fetch(`http://localhost:3000/actividades?project_id=${projectData.idProyecto}`)
        .then((response) => response.json())
        .then((activities) => {
            console.log("Actividades del proyecto:", activities);

            // Limpiar solo las actividades sin eliminar el botón de añadir actividad
            ["Por hacer", "En curso", "Terminadas"].forEach((estado, index) => {
                const column = document.querySelector(`.activity-column:nth-child(${index + 1})`);

                const addButton = column.querySelector(".add-activity-btn");
                const header = column.querySelector("h3");

                column.querySelectorAll(".activity-card").forEach((card) => card.remove());
                column.innerHTML = "";
                column.appendChild(header);
                column.appendChild(addButton);
            });

            activities.forEach((activity) => {
                const activityCard = document.createElement("div");
                const text = document.createElement("p");
                text.textContent = activity.descripcion;
        
                const btnBackAct = document.createElement("button");
                btnBackAct.className = "btn-back-act";
                btnBackAct.textContent = "<";
        
                btnBackAct.addEventListener("click", async () => {
                  let newState;
                  // Determinar el nuevo estado solo si no está en "Por hacer"
                  if (activity.estado === "En curso") {
                    newState = "Por hacer";
                  } else if (activity.estado === "Terminada") {
                    newState = "En curso";
                  } else {
                    console.log("Activity is already in the earliest state: Por hacer");
                    return; // No hacer nada si ya está en "Por hacer"
                  }
        
                  try {
                    const response = await fetch(
                      `http://localhost:3000/actividades/${activity.id_actividad}/cambiarEstado`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ nuevoEstado: newState }),
                      }
                    );
        
                    if (!response.ok) {
                      throw new Error("Error updating activity");
                    }
        
                    console.log(`Activity moved to state: ${newState}`);
                    // Optionally, update the DOM or reload activities
                  } catch (error) {
                    console.error("Failed to move activity back:", error);
                  }
                });
        
                const btnForwAct = document.createElement("button");
                btnForwAct.className = "btn-forw-act";
                btnForwAct.textContent = ">";
        
                btnForwAct.addEventListener("click", async () => {
                  const newState =
                    activity.estado === "Por hacer" ? "En curso" : "Terminada";
        
                  try {
                    const response = await fetch(
                      `http://localhost:3000/actividades/${activity.id_actividad}/cambiarEstado`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ nuevoEstado: newState }),
                      }
                    );
        
                    if (!response.ok) {
                      throw new Error("Error updating activity");
                    }
        
                    console.log(`Activity moved to state: ${newState}`);
                    // Optionally, update the DOM or reload activities
                  } catch (error) {
                    console.error("Failed to move activity forward:", error);
                  }
                });
        
                console.log(btnForwAct.className);
                activityCard.appendChild(text);
                activityCard.appendChild(btnBackAct);
                activityCard.appendChild(btnForwAct);
        
                activityCard.classList.add("activity-card");

                if (activity.estado === "Por hacer") {
                    document.querySelector(".activity-column:nth-child(1)").appendChild(activityCard);
                } else if (activity.estado === "En curso") {
                    document.querySelector(".activity-column:nth-child(2)").appendChild(activityCard);
                } else if (activity.estado === "Terminada") {
                    document.querySelector(".activity-column:nth-child(3)").appendChild(activityCard);
                }
            });
        })
        .catch((error) => console.error("Error al obtener actividades:", error));

        // **Reasignar eventos a los botones para evitar duplicados**
        const editBtn = document.getElementById("edit-btn");
        const newProjectBtn = document.getElementById("newProjectBtn");

        // Eliminar eventos previos con replaceWith
        editBtn.replaceWith(editBtn.cloneNode(true));
        newProjectBtn.replaceWith(newProjectBtn.cloneNode(true));

        // Reasignar eventos únicos
        document.getElementById("edit-btn").addEventListener("click", () => {
        console.log("Edit project button clicked");
        ipcRenderer.send("open-edit-project-window", projectData);
        });

        document.getElementById("newProjectBtn").addEventListener("click", () => {
        console.log("New project button clicked");
        ipcRenderer.send("open-new-project-window");
        });

        document.getElementById("delete-btn").addEventListener("click", () => {
        const deleteButton = document.getElementById("delete-btn");
        const newDeleteButton = deleteButton.cloneNode(true);
        deleteButton.replaceWith(newDeleteButton);

        newDeleteButton.addEventListener("click", () => {
            if (confirm(`¿Seguro que deseas eliminar el proyecto "${projectData.name}"?`)) {
                fetch("http://localhost:3000/proyectos", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((response) => response.json())
                    .then((projects) => {
                        const remainingProjects = projects.filter(
                            (project) => project.id_proyecto !== projectData.idProyecto
                        );
                        const lastProject = remainingProjects[remainingProjects.length - 1];

                        if (lastProject) {
                            const nextProjectData = {
                                idProyecto: lastProject.id_proyecto,
                                name: lastProject.nombre,
                                endDate: lastProject.fecha_termino,
                                startDate: lastProject.fecha_inicio,
                                description: lastProject.descripcion,
                            };
                            localStorage.setItem("proy", JSON.stringify(nextProjectData));
                        } else {
                            localStorage.removeItem("proy");
                        }

                        return fetch(`http://localhost:3000/proyectos/${projectData.idProyecto}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });
                    })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("No se pudo eliminar el proyecto");
                        }
                        console.log("Proyecto eliminado con éxito");
                        location.reload();
                    })
                    .catch((error) => console.error("Error al eliminar el proyecto:", error));
            }
        });
    });

}


// Cargar actividades cuando se recibe el evento de cargar el proyecto
ipcRenderer.on("load-project", (event) => {
    const projectData = JSON.parse(localStorage.getItem("proy"));
    loadActivities(projectData);
    console.log("cargo")
    // Agregar eventos para botones de añadir actividad por columna
    document.getElementById("add-act-btn-por-hacer").addEventListener("click", () => {
        const currentProject = JSON.parse(localStorage.getItem("proy"));
        ipcRenderer.send("new-activity", { estado: "Por hacer", project_id: currentProject.idProyecto });
    });
    document.getElementById("add-act-btn-en-curso").addEventListener("click", () => {
        const currentProject = JSON.parse(localStorage.getItem("proy"));
        ipcRenderer.send("new-activity", { estado: "En curso", project_id: currentProject.idProyecto });
    });
    document.getElementById("add-act-btn-terminada").addEventListener("click", () => {
        const currentProject = JSON.parse(localStorage.getItem("proy"));
        ipcRenderer.send("new-activity", { estado: "Terminada", project_id: currentProject.idProyecto });
    });

    //FETCH TO LOAD ALL PROYECTS
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
        .then((data) => {
            console.log("Proyectos obtenidos:", data);
            renderProjects(data, projectData.idProyecto);

        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

// Function to render the projects
function renderProjects(projects, idSelected) {
    const projectList = document.getElementById("proy-list");
    projectList.innerHTML = ""; // Clear any existing projects

    projects.forEach((project) => {
        const projectDiv = document.createElement("div");
        projectDiv.className = "div-proy-lista"; // Apply the same class for styling
        projectDiv.innerHTML = `
              <li class="project-item" data-id="${project.id_proyecto}">${project.nombre}</li>
              <div class="activities-container"></div>
            <div class="bar-under-proy"></div>`;
        projectList.appendChild(projectDiv);

        projectDiv
            .getElementsByClassName("project-item")[0]
            .addEventListener("click", () => {
                console.log(project, "when");
                // renderSelectedProy(project.id_proyecto);
                renderProjects(projects, project.id_proyecto);
                const dataActivites = {
                    idProyecto: project.id_proyecto,
                    name: project.nombre,
                    endDate: project.fecha_termino,
                    startDate: project.fecha_inicio,
                    description: project.descripcion

                }
                localStorage.setItem("proy", JSON.stringify(dataActivites));
                loadActivities(dataActivites);
            });
    });
    renderSelectedProy(idSelected);

}

function renderSelectedProy(idProyecto) {
    //buscar proy seleccionado
    const projectElement = document.querySelector(`[data-id="${idProyecto}"]`);
    if (projectElement) {
        console.log("Found project element:", projectElement);

        projectElement.className = "project-item active";
        console.log(projectElement.parentElement);

        projectElement.parentElement
            .getElementsByClassName("bar-under-proy")[0]
            .remove();

        const barUnderGradient = document.createElement("div");
        barUnderGradient.className = "bar-under-selected-gradient";
        const triangleLeft = document.createElement("div");
        triangleLeft.className = "triangle-left";
        const triangleRight = document.createElement("div");
        triangleRight.className = "triangle-right";
        const activeGradient = document.createElement("div");
        activeGradient.className = "active-gradient";
        const barUnderProyActive = document.createElement("div");
        barUnderProyActive.className = "bar-under-proy-active";

        projectElement.parentElement.appendChild(barUnderGradient);
        barUnderGradient.appendChild(projectElement);
        barUnderGradient.appendChild(triangleLeft);
        barUnderGradient.appendChild(triangleRight);
        barUnderGradient.appendChild(activeGradient);
        barUnderGradient.appendChild(barUnderProyActive);
    } else {
        console.log("No element found with the specified data-id");
    }
}

function renderProjectDetails(projectData) {
    const projectDetailsColumn = document.querySelector(".project-details-column");

    if (projectDetailsColumn) {
        projectDetailsColumn.innerHTML = `
            <div class="project-description">
                <h3>Detalles del proyecto</h3>
                <p><strong>Descripción: </strong>${projectData.description}</p>
            </div>
            <div class="project-dates">
                <p><strong>Inicio:</strong> ${formatDate(projectData.startDate)}</p>
                <p><strong>Fin:</strong> ${formatDate(projectData.endDate)}</p>
            </div>
        `;
    }
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}






