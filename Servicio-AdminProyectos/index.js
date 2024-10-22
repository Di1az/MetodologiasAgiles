const express = require('express');
const db = require('./db');  // Importar la conexión de la base de datos
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

/////////////////// CRUD PROYECTO ///////////////////

// Obtener todos los proyectos
app.get('/proyectos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Proyecto');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un proyecto por ID
app.get('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM Proyecto WHERE id_proyecto = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo proyecto
app.post('/proyectos', async (req, res) => {
    const { nombre, descripcion, fecha_inicio, fecha_termino } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Proyecto (nombre, descripcion, fecha_inicio, fecha_termino) VALUES (?, ?, ?, ?)', 
            [nombre, descripcion, fecha_inicio, fecha_termino]
        );
        res.status(201).json({ id_proyecto: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un proyecto por ID
app.put('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fecha_inicio, fecha_termino } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE Proyecto SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_termino = ? WHERE id_proyecto = ?',
            [nombre, descripcion, fecha_inicio, fecha_termino, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
        res.json({ message: 'Proyecto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un proyecto por ID
app.delete('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM Proyecto WHERE id_proyecto = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
        res.json({ message: 'Proyecto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/////////////////// CRUD ACTIVIDAD ///////////////////

// Obtener todas las actividades
app.get('/actividades', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Actividad');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva actividad
app.post('/actividades', async (req, res) => {
    const { descripcion, costo, fecha_inicio, fecha_termino, id_responsable, id_proyecto } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Actividad (descripcion, costo, fecha_inicio, fecha_termino, id_responsable, id_proyecto) VALUES (?, ?, ?, ?, ?, ?)',
            [descripcion, costo, fecha_inicio, fecha_termino, id_responsable, id_proyecto]
        );
        res.status(201).json({ id_actividad: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una actividad por ID
app.delete('/actividades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM Actividad WHERE id_actividad = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Actividad no encontrada' });
        res.json({ message: 'Actividad eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/////////////////// CRUD TRABAJADOR ///////////////////

// Obtener todos los trabajadores
app.get('/trabajadores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Trabajador');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo trabajador
app.post('/trabajadores', async (req, res) => {
    const { nombre_trabajador } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Trabajador (nombre_trabajador) VALUES (?)',
            [nombre_trabajador]
        );
        res.status(201).json({ id_trabajador: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/////////////////// CRUD ADMIN ///////////////////

// Obtener todos los admins
app.get('/admins', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Admin');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo admin
app.post('/admins', async (req, res) => {
    const { nombre_admin } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Admin (nombre_admin) VALUES (?)',
            [nombre_admin]
        );
        res.status(201).json({ id_admin: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/////////////////// Iniciar el servidor ///////////////////

app.listen(port, () => {
    console.log(`Microservicio escuchando en http://localhost:${port}`);
});
