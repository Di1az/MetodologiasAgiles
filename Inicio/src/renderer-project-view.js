const { ipcRenderer } = require("electron");

// Función para cargar las actividades
function loadActivities(projectData) {
    console.log(projectData, "data del proyecto");

    // Actualizar título del proyecto
    document.getElementById("title-project").textContent = projectData.name;
    console.log(projectData.idProyecto);

    // Obtener actividades específicas para este proyecto desde la API
    fetch(`http://localhost:3000/actividades?project_id=${projectData.idProyecto}`)
        .then((response) => response.json())
        .then((activities) => {
            console.log("Actividades del proyecto:", activities);

            // Limpiar solo las actividades sin eliminar el botón de añadir actividad
            ["Por hacer", "En curso", "Terminadas"].forEach((estado, index) => {
                const column = document.querySelector(`.activity-column:nth-child(${index + 1})`);

                // Mantén el botón de añadir actividad y el encabezado de la columna
                const addButton = column.querySelector(".add-activity-btn");
                const header = column.querySelector("h3");

                // Remueve solo las actividades previas
                column.querySelectorAll(".activity-card").forEach((card) => card.remove());

                // Añade de nuevo el encabezado y el botón
                column.innerHTML = ""; // Limpia completamente la columna
                column.appendChild(header);
                column.appendChild(addButton);
            });

            // Distribuir actividades en sus respectivas columnas
            activities.forEach((activity) => {
                const activityCard = document.createElement("div");
                activityCard.classList.add("activity-card");
                activityCard.textContent = activity.descripcion;

                // Agregar a la columna según el estado de la actividad
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
}


// Cargar actividades cuando se recibe el evento de cargar el proyecto
ipcRenderer.on("load-project", (event, projectData) => {
    loadActivities(projectData);

    // Agregar eventos para botones de añadir actividad por columna
    document.getElementById("add-act-btn-por-hacer").addEventListener("click", () => {
        ipcRenderer.send("new-activity", { estado: "Por hacer", project_id: projectData.idProyecto });
    });
    document.getElementById("add-act-btn-en-curso").addEventListener("click", () => {
        ipcRenderer.send("new-activity", { estado: "En curso", project_id: projectData.idProyecto });
    });
    document.getElementById("add-act-btn-terminada").addEventListener("click", () => {
        ipcRenderer.send("new-activity", { estado: "Terminada", project_id: projectData.idProyecto });
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
                console.log(project.id_proyecto, "when");
                // renderSelectedProy(project.id_proyecto);
                renderProjects(projects, project.id_proyecto);
                const dataActivites = {
                    idProyecto: project.id_proyecto,
                    name: project.nombre
                }
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