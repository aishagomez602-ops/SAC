const express = require("express");

const conexion = require("../db");
const { verificarToken } =
    require("../middleware/auth");

const router = express.Router();


// Obtener notificaciones
router.get("/", verificarToken, async (req, res) => {

    try {

        const [notificaciones] =
            await conexion.query(
                `SELECT *
                 FROM notificaciones
                 WHERE id_usuario = ?
                 ORDER BY fecha_notificacion DESC`,
                [req.usuario.id_usuario]
            );

        res.json({
            ok: true,
            notificaciones
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudieron obtener las notificaciones"
        });
    }
});


// Marcar todas como leídas
router.put("/leer", verificarToken, async (req, res) => {

    try {

        await conexion.query(
            `UPDATE notificaciones
             SET leida = TRUE
             WHERE id_usuario = ?`,
            [req.usuario.id_usuario]
        );

        res.json({
            ok: true,
            mensaje:
                "Notificaciones marcadas como leídas"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudieron actualizar"
        });
    }
});


module.exports = router;