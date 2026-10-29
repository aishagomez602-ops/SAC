const express = require("express");

const conexion = require("../db");
const { verificarToken, verificarRol } = require("../middleware/auth");
const { actualizarEstadoReporte } = require("../services/report-status");

const router = express.Router();
const verificarAreaMunicipal = verificarRol("area_municipal");

router.get(
    "/reportes",
    verificarToken,
    verificarAreaMunicipal,
    async (req, res) => {
        try {
            const [reportes] = await conexion.query(
                `SELECT
                    r.id_reporte,
                    r.titulo,
                    r.descripcion,
                    r.direccion,
                    r.latitud,
                    r.longitud,
                    r.foto,
                    r.fecha_reporte,
                    c.nombre AS categoria,
                    e.id_estado,
                    e.nombre AS estado,
                    CONCAT(u.nombre, ' ', u.apellido) AS vecino
                 FROM reportes r
                 INNER JOIN categorias c ON c.id_categoria = r.id_categoria
                 INNER JOIN estados e ON e.id_estado = r.id_estado
                 INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
                 ORDER BY r.fecha_reporte DESC`
            );
            return res.json({ ok: true, reportes });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudieron obtener los reportes municipales"
            });
        }
    }
);

router.get(
    "/estados",
    verificarToken,
    verificarAreaMunicipal,
    async (req, res) => {
        try {
            const [estados] = await conexion.query(
                "SELECT id_estado, nombre FROM estados ORDER BY id_estado"
            );
            return res.json({ ok: true, estados });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudieron obtener los estados"
            });
        }
    }
);

router.put(
    "/reportes/:id/estado",
    verificarToken,
    verificarAreaMunicipal,
    async (req, res) => {
        try {
            const estado = await actualizarEstadoReporte(req.params.id, req.body.id_estado);
            return res.json({
                ok: true,
                mensaje: `El reporte ahora está en estado: ${estado.nombre}`
            });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ ok: false, mensaje: error.message });
            }
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudo actualizar el estado del reporte"
            });
        }
    }
);

module.exports = router;
