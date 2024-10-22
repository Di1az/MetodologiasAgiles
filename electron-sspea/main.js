const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let projectWindow;
let editProjectWindow;

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

  mainWindow.loadFile('index.html');
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

  projectWindow.loadFile('new-project.html');
}

/*
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

  editProjectWindow.loadFile('update-project.html');
  
  // Enviar datos del proyecto a la ventana de edición
  editProjectWindow.webContents.on('did-finish-load', () => {
    editProjectWindow.webContents.send('update-project-data', projectData);
    console.log(projectData.name);
  });
}*/

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

ipcMain.on('open-new-project-window', () => {
  createProjectWindow();
});

ipcMain.on('open-edit-project-window', (event, projectData) => {
  createEditProjectWindow(projectData);
});

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

  editProjectWindow.loadFile('update-project.html');
  
  // Enviar los datos del proyecto actualizados a la ventana de edición
  editProjectWindow.webContents.on('did-finish-load', () => {
    editProjectWindow.webContents.send('update-project-data', projectData);
  });
}

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


