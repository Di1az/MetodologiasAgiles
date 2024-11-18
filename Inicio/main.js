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

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("./view/index.html");
}

function createProjectWindow() {
  projectWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

// app.whenReady().then(() => {
//   createMainWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
//   });
// });

function createEditProjectWindow(projectData) {
  editProjectWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

function openProjectViewWindow(projectData) {
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
    height: 600,
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
    openProjectViewWindow(projectData);
  }
});

ipcMain.on("add-project", (event, projectData) => {
  mainWindow.webContents.send("new-project", projectData);
  projectWindow.close();
});

ipcMain.on("update-project", (event, updatedProjectData) => {
  mainWindow.webContents.send("project-updated", updatedProjectData);
  editProjectWindow.close();
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
app.whenReady().then(() => {
  createLoginWindow();

  ipcMain.on("login-success", () => {
    if (loginWindow) loginWindow.close(); // Close login window
    createMainWindow(); // Open main window after login
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


