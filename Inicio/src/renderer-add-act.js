const { ipcRenderer } = require("electron");

ipcRenderer.on("load-state", (event, data) => {
  select = document.getElementById("status");
  if (select) {
    console.log("le puse el estado", data.estado);
    console.log("id", data.project_id);
    //////////////////////
    select.value = data.estado;
  }

  document.getElementById("actForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const activity= JSON.stringify({
        descripcion: document.getElementById("descripcion").value,
        estado: document.getElementById("status").value,
        costo: document.getElementById("cost").value,
        fecha_inicio: document.getElementById("startDate").value,
        fecha_termino: document.getElementById("endDate").value,
        id_responsable: document.getElementById("responsibleId").value,
        id_proyecto: data.project_id
    });

    //CHECAR CAMPOS PARA QUE SEAN VALIDOS LOS DATOS
    fetch("http://localhost:3000/actividades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: activity
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fallo al crear la actividad");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Actividad creada:", data);

            

        })
        .catch((error) => {
          console.error("Error:", error);
        });
  });


});
