import supertest from "supertest";
import app from "../src/app.js";


import { use, expect } from "chai";
import chaiHttp from "chai-http";

// Configurar chai para usar chai-http
const chai = use(chaiHttp);

describe("API de Proyectos", () => {
  it("Regresa todos los proyectos", (done) => {
    chai
      .request(app)
      .get("/proyectos")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
        // console.log(res.body)
      });
  });

  it("debería devolver un proyecto por ID", (done) => {
    const projectId = 1; // Ajustar según datos
    chai
      .request(app)
      .get(`/proyectos/${projectId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id_proyecto", projectId);
        done();
      });
  });

  it("debería crear un nuevo proyecto", (done) => {
    const newProject = {
      nombre: "Nuevo Proyecto",
      descripcion: "Descripción del nuevo proyecto",
      fecha_inicio: "2024-01-01",
      fecha_termino: "2024-12-31",
    };
    chai
      .request(app)
      .post("/proyectos")
      .send(newProject)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id_proyecto");
        done();
      });
  });

  it("debería actualizar un proyecto por ID", (done) => {
    const projectId = 1; // Ajustar según datos
    const updatedProject = {
      nombre: "Proyecto Actualizado",
      descripcion: "Descripción actualizada",
      fecha_inicio: "2024-02-01",
      fecha_termino: "2024-11-30",
    };
    chai
      .request(app)
      .put(`/proyectos/${projectId}`)
      .send(updatedProject)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Proyecto actualizado");
        done();
      });
  });

  it("debería eliminar un proyecto por ID", (done) => {
    const projectId = 3; // Ajustar según datos
    chai
      .request(app)
      .delete(`/proyectos/${projectId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Proyecto eliminado");
        done();
      });
  });

  // Pruebas de Actividades
  it("debería devolver todas las actividades", (done) => {
    chai
      .request(app)
      .get("/actividades")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  it("debería crear una nueva actividad", (done) => {
    const newActivity = {
      descripcion: "Nueva Actividad",
      costo: 100,
      fecha_inicio: "2024-01-01",
      fecha_termino: "2024-01-10",
      id_responsable: 1, // Ajustar según datos
      id_proyecto: 1, // Ajustar según datos
    };
    chai
      .request(app)
      .post("/actividades")
      .send(newActivity)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id_actividad");
        done();
      });
  });

  it("debería eliminar una actividad por ID", (done) => {
    const activityId = 2; // Ajustar según datos
    chai
      .request(app)
      .delete(`/actividades/${activityId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Actividad eliminada");
        done();
      });
  });

  // Pruebas de Trabajadores
  it("debería devolver todos los trabajadores", (done) => {
    chai
      .request(app)
      .get("/trabajadores")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  it("debería crear un nuevo trabajador", (done) => {
    const newWorker = {
      nombre_trabajador: "Nuevo Trabajador",
    };
    chai
      .request(app)
      .post("/trabajadores")
      .send(newWorker)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id_trabajador");
        done();
      });
  });

  // Pruebas de Admins
  it("debería devolver todos los admins", (done) => {
    chai
      .request(app)
      .get("/admins")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  it("debería crear un nuevo admin", (done) => {
    const newAdmin = {
      nombre_admin: "Nuevo Admin",
    };
    chai
      .request(app)
      .post("/admins")
      .send(newAdmin)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id_admin");
        done();
      });
  });


});