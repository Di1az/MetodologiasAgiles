const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let projectWindow;
let editProjectWindow;
let projectViewWindow; 

//LOGIN WINDOW
let loginWindow;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loginWindow.loadURL('http://localhost:3001/auth/google');
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('./view/index.html');
}

function createProjectWindow() {
  projectWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  projectWindow.loadFile('./view/new-project.html');
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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  editProjectWindow.loadFile('./view/update-project.html');
  
  // Enviar los datos del proyecto actualizados a la ventana de edición
  editProjectWindow.webContents.on('did-finish-load', () => {
    editProjectWindow.webContents.send('update-project-data', projectData);
  });
}

function openProjectViewWindow() {
  projectViewWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  projectViewWindow.loadFile('./view/project-view.html');
  projectViewWindow.center();

  // Evento para manejar el cierre de projectViewWindow
  projectViewWindow.on('closed', () => {
    projectViewWindow = null;
  });
}

// Eventos IPC
ipcMain.on('open-new-project-window', () => {
  createProjectWindow();
});

ipcMain.on('open-edit-project-window', (event, projectData) => {
  createEditProjectWindow(projectData);
});

ipcMain.on("open-project-view", () => {
  if (!projectViewWindow) {
    openProjectViewWindow();
  }
});

ipcMain.on('add-project', (event, projectData) => {
  mainWindow.webContents.send('new-project', projectData);
  projectWindow.close();
});

ipcMain.on('update-project', (event, updatedProjectData) => {
  mainWindow.webContents.send('project-updated', updatedProjectData);
  editProjectWindow.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


//LOGIN SUCCES
app.whenReady().then(() => {
  createLoginWindow();

  ipcMain.on('login-success', () => {
    if (loginWindow) loginWindow.close(); // Close login window
    createMainWindow(); // Open main window after login
  });
});


