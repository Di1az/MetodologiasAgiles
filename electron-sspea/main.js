const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let projectWindow;

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

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

ipcMain.on('open-new-project-window', () => {
  createProjectWindow();
});

ipcMain.on('add-project', (event, projectData) => {
  mainWindow.webContents.send('new-project', projectData);
  projectWindow.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


