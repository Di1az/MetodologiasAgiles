(async () => {
    const chai = await import('chai');
    const chaiHttp = await import('chai-http');
    const server = await import('../src/index'); // Asegúrate de apuntar correctamente al archivo del servidor
  
    const should = chai.should();
    chai.use(chaiHttp);

describe('CRUD de Proyecto', () => {
    it('Debe obtener todos los proyectos', (done) => {
        request(app)
            .get('/proyectos')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('Debe crear un nuevo proyecto', (done) => {
        const nuevoProyecto = {
            nombre: 'Nuevo Proyecto',
            descripcion: 'Descripción del proyecto',
            fecha_inicio: '2024-01-01',
            fecha_termino: '2024-12-31'
        };

        request(app)
            .post('/proyectos')
            .send(nuevoProyecto)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id_proyecto');
                done();
            });
    });

    it('Debe obtener un proyecto por ID', (done) => {
        const proyectoId = 1;  // Cambia esto por un ID válido de tu base de datos

        request(app)
            .get(`/proyectos/${proyectoId}`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('id_proyecto', proyectoId);
                done();
            });
    });

    it('Debe actualizar un proyecto por ID', (done) => {
        const proyectoId = 1;  // Cambia esto por un ID válido de tu base de datos
        const actualizacion = {
            nombre: 'Proyecto Actualizado',
            descripcion: 'Descripción actualizada',
            fecha_inicio: '2024-01-01',
            fecha_termino: '2024-12-31'
        };

        request(app)
            .put(`/proyectos/${proyectoId}`)
            .send(actualizacion)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'Proyecto actualizado');
                done();
            });
    });

    it('Debe eliminar un proyecto por ID', (done) => {
        const proyectoId = 1;  // Cambia esto por un ID válido de tu base de datos

        request(app)
            .delete(`/proyectos/${proyectoId}`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'Proyecto eliminado');
                done();
            });
    });
})
})();
