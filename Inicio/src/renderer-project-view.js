const { ipcRenderer } = require('electron');

ipcRenderer.on('load-project', (event, projectData)=>{

    console.log(projectData,' aca proy');
    
    document.getElementById('title-project').textContent=projectData.name;

    document.getElementById('add-act-btn-por-hacer').addEventListener('click', event =>{
        //se manda el estado para agregarlo auto.
        const estado='Por hacer';
        const data={
            'estado':estado,
            'project_id':projectData.idProyecto,
        }
        console.log(data);
        ipcRenderer.send('new-activity', data);
    });

    document.getElementById('add-act-btn-en-curso').addEventListener('click', event =>{
        //se manda el estado para agregarlo auto.
        const estado='En curso';
        const data={
            'estado':estado,
            'project_id':projectData.idProyecto,
        }
        console.log(data);
        ipcRenderer.send('new-activity', data);
    });

    document.getElementById('add-act-btn-terminada').addEventListener('click', event =>{
        //se manda el estado para agregarlo auto.
        const estado='Terminada';
        const data={
            'estado':estado,
            'project_id':projectData.idProyecto,
        }
        console.log(data);
        ipcRenderer.send('new-activity', data);
    });

    
  });