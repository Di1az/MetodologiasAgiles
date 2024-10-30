const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.includes('auth/success')) {
    ipcRenderer.send('login-success');
  }
});
