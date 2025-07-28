const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // tu contraseña MySQL si tienes
  database: 'proyectoweb'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Ruta para insertar un mensaje de contacto
app.post('/contacto', (req, res) => {
  const { nombreCompleto, correo, mensaje } = req.body;

  if (!nombreCompleto || !correo || !mensaje) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = 'INSERT INTO contactos (nombre_completo, correo, mensaje) VALUES (?, ?, ?)';
  db.query(sql, [nombreCompleto, correo, mensaje], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error guardando en la base de datos' });
    }
    res.json({ mensaje: 'Mensaje guardado correctamente', id: result.insertId });
  });
});

// Ruta para registrar historial clínico (crear)
app.post('/registrar', (req, res) => {
  const { nombrePaciente, fechaNacimiento, sexo, diagnostico, tratamiento, observaciones } = req.body;

  if (!nombrePaciente || !fechaNacimiento || !sexo || !diagnostico || !tratamiento) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = `
    INSERT INTO historial_clinico 
      (nombre_paciente, fecha_nacimiento, sexo, diagnostico, tratamiento, observaciones) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombrePaciente, fechaNacimiento, sexo, diagnostico, tratamiento, observaciones || null], (err, result) => {
    if (err) {
      console.error('Error guardando historial:', err);
      return res.status(500).json({ error: 'Error guardando en la base de datos' });
    }
    res.json({ mensaje: 'Historial guardado correctamente', id: result.insertId });
  });
});

// Ruta para listar todos los historiales clínicos
app.get('/registrar', (req, res) => {
  const sql = 'SELECT * FROM historial_clinico ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener historiales:', err);
      return res.status(500).json({ error: 'Error al obtener historiales' });
    }
    res.json(results);
  });
});

// Ruta para eliminar un historial por id
app.delete('/registrar/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM historial_clinico WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar historial:', err);
      return res.status(500).json({ error: 'Error al eliminar historial' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    res.json({ mensaje: 'Historial eliminado correctamente' });
  });
});

// Ruta para actualizar un historial por id
app.put('/registrar/:id', (req, res) => {
  const { id } = req.params;
  const { nombrePaciente, fechaNacimiento, sexo, diagnostico, tratamiento, observaciones } = req.body;

  if (!nombrePaciente || !fechaNacimiento || !sexo || !diagnostico || !tratamiento) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = `
    UPDATE historial_clinico SET
      nombre_paciente = ?,
      fecha_nacimiento = ?,
      sexo = ?,
      diagnostico = ?,
      tratamiento = ?,
      observaciones = ?
    WHERE id = ?
  `;

  db.query(sql, [nombrePaciente, fechaNacimiento, sexo, diagnostico, tratamiento, observaciones || null, id], (err, result) => {
    if (err) {
      console.error('Error actualizando historial:', err);
      return res.status(500).json({ error: 'Error actualizando historial' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    res.json({ mensaje: 'Historial actualizado correctamente' });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
