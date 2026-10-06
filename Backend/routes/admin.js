const express = require("express");

const conexion = require("../db");

const {
    verificarToken,
    verificarAdministrador
} = require("../middleware/auth");

const router = express.Router();


// ========================================
// VER TODOS LOS USUARIOS
// ========================================

router.get(
    "/usuarios",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {

        try {

            const [usuarios] =
                await conexion.query(
                    `SELECT
                        id_usuario,
                        nombre,
                        apellido,
                        email,
                        rol,
                        fecha_registro
                     FROM usuarios
                     ORDER BY id_usuario DESC`
                );

            res.json({
                ok: true,
                usuarios
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron obtener los usuarios"
            });
        }
    }
);


// ========================================
// CAMBIAR ROL
// ========================================

router.put(
    "/usuarios/:id/rol",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {

        try {

            const idUsuario =
                req.params.id;

            const { rol } = req.body;

            if (
                rol !== "vecino" &&
                rol !== "administrador"
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Rol inválido"
                });
            }

            await conexion.query(
                `UPDATE usuarios
                 SET rol = ?
                 WHERE id_usuario = ?`,
                [
                    rol,
                    idUsuario
                ]
            );

            res.json({
                ok: true,
                mensaje:
                    "Rol actualizado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo cambiar el rol"
            });
        }
    }
);


// ========================================
// CAMBIAR ESTADO DEL REPORTE
// ========================================

router.put(
    "/reportes/:id/estado",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {

        try {

            const idReporte =
                req.params.id;

            const { id_estado } =
                req.body;

            if (!id_estado) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Falta seleccionar el estado"
                });
            }

            const [reportes] =
                await conexion.query(
                    `SELECT id_usuario
                     FROM reportes
                     WHERE id_reporte = ?`,
                    [idReporte]
                );

            if (reportes.length === 0) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Reporte no encontrado"
                });
            }

            const [estados] =
                await conexion.query(
                    `SELECT nombre
                     FROM estados
                     WHERE id_estado = ?`,
                    [id_estado]
                );

            if (estados.length === 0) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Estado inválido"
                });
            }

            await conexion.query(
                `UPDATE reportes
                 SET id_estado = ?
                 WHERE id_reporte = ?`,
                [
                    id_estado,
                    idReporte
                ]
            );

            const mensaje =
                `Tu reporte ahora está en estado: ${estados[0].nombre}`;

            await conexion.query(
                `INSERT INTO notificaciones
                (
                    id_usuario,
                    id_reporte,
                    tipo,
                    mensaje
                )
                VALUES (?, ?, 'estado', ?)`,
                [
                    reportes[0].id_usuario,
                    idReporte,
                    mensaje
                ]
            );

            res.json({
                ok: true,
                mensaje:
                    "Estado actualizado correctamente"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar el estado"
            });
        }
    }
);


module.exports = router;