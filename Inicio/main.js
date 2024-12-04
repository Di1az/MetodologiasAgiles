const { app, BrowserWindow, ipcMain, webContents } = require("electron");
const path = require("path");

let mainWindow;
let projectWindow;
let editProjectWindow;
let projectViewWindow;
let newActivity;
//LOGIN WINDOW
let loginWindow;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loginWindow.loadURL("http://localhost:3001/auth/google");
}


function createProjectWindow() {
  projectWindow = new BrowserWindow({
    width: 800,
    height: 800,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  projectWindow.loadFile("./view/new-project.html");
}

function createEditProjectWindow(projectData) {
  editProjectWindow = new BrowserWindow({
    width: 800,
    height: 650,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  console.log("carga html");
  editProjectWindow.loadFile("./view/update-project.html");
  console.log("abriendo");
  // Enviar los datos del proyecto actualizados a la ventana de edición
  editProjectWindow.webContents.on("did-finish-load", () => {
    console.log("Window loaded, sending project data");
    editProjectWindow.webContents.send("update-project-data", projectData);
  });
}

function createMainWindow(projectData) {
  projectViewWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  
  projectViewWindow.loadFile("./view/project-view.html");
  projectViewWindow.center();

  projectViewWindow.webContents.on("did-finish-load", () => {
  projectViewWindow.webContents.send("load-project", projectData);

  });


  // Evento para manejar el cierre de projectViewWindow
  projectViewWindow.on("closed", () => {
    projectViewWindow = null;
  });
}

function openNewActivityWindow(data) {
  newActivity = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  newActivity.loadFile("./view/new-activity.html");
  newActivity.center();

  newActivity.webContents.on("did-finish-load", () => {
    newActivity.webContents.send("load-state", data);
  });

  // Evento para manejar el cierre de projectViewWindow
  newActivity.on("closed", () => {
    newActivity = null;
  });
}
// Eventos IPC
ipcMain.on("open-new-project-window", () => {
  createProjectWindow();
});

ipcMain.on("delete-project", (projectData) => {
  console.log("llega al main");
  deleteProject(projectData);
  console.log(projectData);
});

ipcMain.on("open-edit-project-window", (event, projectData) => {
  console.log("llega al main");
  try {
    createEditProjectWindow(projectData);
  } catch (error) {
    console.error("Error creating edit window:", error);
  }
});

ipcMain.on("open-project-view", (event, projectData) => {
  if (!projectViewWindow) {
    createMainWindow(projectData);
  }
});

ipcMain.on("add-project", (event, projectData) => {
  console.log("Recibiendo datos para agregar un proyecto:", projectData);
  
  // Llamar a la función para agregar el proyecto
  addProject(projectData)
    .then(() => {
      console.log("Proyecto agregado con éxito");
      
      // Notificar a la ventana principal (si es necesario)
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("new-project", projectData);
      } else {
        console.error("mainWindow no está inicializado");
      }
      
      // Cerrar la ventana de creación del proyecto
      if (projectWindow) {
        projectWindow.close();
      }
    })
    .catch((error) => {
      console.error("Error al agregar el proyecto:", error);
    });
});

ipcMain.on("update-project", (event, updatedProjectData) => {
  if (editProjectWindow && editProjectWindow.webContents) {
    editProjectWindow.webContents.send("project-updated", updatedProjectData);
} else {
    console.error("editProjectWindow no está inicializada.");
}  editProjectWindow.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("new-activity", (event, data) => {
  if (!newActivity) {
    openNewActivityWindow(data);
  }
});

// Escucha el evento para guardar actividad y cerrar la ventana
ipcMain.on("save-activity", (event, activityData) => {
  mainWindow.webContents.send("activity-saved", activityData);
  if (newActivity) {
    newActivity.close();
  }
});

//LOGIN SUCCES
/*
app.whenReady().then(() => {
  createLoginWindow();

  ipcMain.on("login-success", () => {
    if (loginWindow) loginWindow.close(); 
    if (!mainWindow) createMainWindow(); 
  });
});
*/

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});


function deleteProject(projectData) {
  fetch(`http://localhost:3000/proyectos/${projectData}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    if (!response.ok) {
      console.log("Response error:", response);
      throw new Error("Fallo al eliminar el proyecto");
    }
    return response.json(); // Aquí asegúrate de manejar la respuesta correctamente
  })
  .then((data) => {
    console.log("Proyecto eliminado", data);
    // Si la ventana se puede cerrar, se cierra
    window.close();
  })
  .catch((error) => {
    console.error("Error:", error);
  });
}

// Función para agregar el proyecto a la API
function addProject(projectData) {
  return fetch("http://localhost:3000/proyectos", {
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
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Fallo al agregar el proyecto");
    }
    return response.json();
  });
}

ipcMain.on("update-project-request", async (event, updatedProjectData) => {
  try {
      const response = await fetch(`http://localhost:3000/proyectos/${updatedProjectData.idProyecto}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              nombre: updatedProjectData.name,
              descripcion: updatedProjectData.description,
              fecha_inicio: updatedProjectData.startDate,
              fecha_termino: updatedProjectData.endDate,
          }),
      });

      if (!response.ok) {
          throw new Error("Error al actualizar el proyecto");
      }

      const result = await response.json();

      // Enviar confirmación al renderer
      event.sender.send("update-project-success", result);
  } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
      event.sender.send("update-project-failure", error.message);
  }
});

// Escucha el evento para cerrar ventanas
ipcMain.on("close-window", () => {
  // Cierra la ventana activa del proyecto si existe
  if (projectWindow && !projectWindow.isDestroyed()) {
    projectWindow.close();
    projectWindow = null;
  }
});

ipcMain.on('close-window', () => {
  if (editProjectWindow && !editProjectWindow.isDestroyed()) {
    editProjectWindow.close();
    editProjectWindow = null;
  }
});

ipcMain.on('close-window', () => {
  if (newActivity && !newActivity.isDestroyed()) {
    newActivity.close();
    newActivity = null;
  }
});





