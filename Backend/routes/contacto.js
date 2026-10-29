const express = require("express");

const conexion = require("../db");
const { verificarToken, verificarRol } = require("../middleware/auth");

const router = express.Router();
const verificarVecino = verificarRol("vecino");

router.post("/", verificarToken, verificarVecino, async (req, res) => {
    const asunto = typeof req.body.asunto === "string" ? req.body.asunto.trim() : "";
    const mensaje = typeof req.body.mensaje === "string" ? req.body.mensaje.trim() : "";

    if (asunto.length < 5 || asunto.length > 100 || mensaje.length < 20 || mensaje.length > 1000) {
        return res.status(400).json({
            ok: false,
            mensaje: "El asunto debe tener 5–100 caracteres y el mensaje 20–1000 caracteres"
        });
    }

    try {
        await conexion.query(
            `INSERT INTO contacto (id_usuario, asunto, mensaje)
             VALUES (?, ?, ?)`,
            [req.usuario.id_usuario, asunto, mensaje]
        );

        return res.status(201).json({
            ok: true,
            mensaje: "Tu consulta fue enviada correctamente"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo enviar tu consulta"
        });
    }
});

module.exports = router;
