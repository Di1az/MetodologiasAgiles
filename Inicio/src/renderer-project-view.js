const { ipcRenderer } = require('electron');

ipcRenderer.on('load-project', (event, projectData)=>{
    console.log('wasaaaa')
    console.log(projectData,' aca proy');
    
    document.getElementById('title-project').textContent=projectData.name;
  });