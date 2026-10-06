const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const conexion = require("../db");
const { verificarToken } = require("../middleware/auth");

const router = express.Router();


// ===============================
// REGISTRO
// ===============================

router.post("/registro", async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            email,
            contrasena
        } = req.body;

        if (
            !nombre ||
            !apellido ||
            !email ||
            !contrasena
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Completá todos los campos"
            });
        }

        const [usuarios] = await conexion.query(
            "SELECT id_usuario FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El email ya está registrado"
            });
        }

        const contrasenaEncriptada =
            await bcrypt.hash(contrasena, 10);

        const [resultado] = await conexion.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, contrasena, rol)
            VALUES (?, ?, ?, ?, 'vecino')`,
            [
                nombre,
                apellido,
                email,
                contrasenaEncriptada
            ]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado correctamente",
            usuario: {
                id_usuario: resultado.insertId,
                nombre,
                apellido,
                email,
                rol: "vecino"
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});


// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            contrasena
        } = req.body;

        if (!email || !contrasena) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ingresá email y contraseña"
            });
        }

        const [usuarios] = await conexion.query(
            `SELECT *
             FROM usuarios
             WHERE email = ?`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const usuario = usuarios[0];

        const contraseñaCorrecta =
            await bcrypt.compare(
                contrasena,
                usuario.contrasena
            );

        if (!contraseñaCorrecta) {
            return res.status(401).json({
                ok: false,
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        delete usuario.contrasena;

        res.json({
            ok: true,
            mensaje: "Inicio de sesión correcto",
            token,
            usuario
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});


// ===============================
// USUARIO ACTUAL
// ===============================

router.get("/usuario", verificarToken, async (req, res) => {

    try {

        const [usuarios] = await conexion.query(
            `SELECT
                id_usuario,
                nombre,
                apellido,
                email,
                foto,
                rol,
                fecha_registro
             FROM usuarios
             WHERE id_usuario = ?`,
            [req.usuario.id_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({
            ok: true,
            usuario: usuarios[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});


module.exports = router;