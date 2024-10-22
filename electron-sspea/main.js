// main.js
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let addProjectWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile('index.html'); // Pantalla principal

  // Crear ventana de agregar proyecto
  ipcMain.on('open-add-project-window', () => {
    if (!addProjectWindow) {
      addProjectWindow = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      addProjectWindow.loadFile(`../Servicio-AdminProyectos/new-project.html`);

      addProjectWindow.on('closed', () => {
        addProjectWindow = null; // Limpiar la referencia cuando se cierre
      });
    }
  });

  // Recibir los datos del proyecto desde la ventana de agregar proyecto
  ipcMain.on('add-project', (event, projectData) => {
    // Aquí puedes manejar la lógica, como guardar el proyecto
    console.log('Nuevo proyecto recibido:', projectData);

    // Enviar el proyecto al proceso de la ventana principal
    mainWindow.webContents.send('project-added', projectData);
    
    // Cerrar la ventana de agregar proyecto
    if (addProjectWindow) {
      addProjectWindow.close();
      addProjectWindow = null;
    }
  });

  // Cerrar la ventana de agregar proyecto
  ipcMain.on('close-window', () => {
    if (addProjectWindow) {
      addProjectWindow.close();
      addProjectWindow = null;
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

