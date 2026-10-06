const express = require("express");
const multer = require("multer");
const path = require("path");

const conexion = require("../db");
const {
    verificarToken
} = require("../middleware/auth");

const router = express.Router();


// ========================================
// CONFIGURACIÓN DE FOTOS
// ========================================

const almacenamiento = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/reportes");
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const nombre =
            "reporte_" +
            Date.now() +
            extension;

        cb(null, nombre);
    }
});

const subirFoto = multer({
    storage: almacenamiento,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


// ========================================
// CREAR REPORTE
// ========================================

router.post(
    "/crear",
    verificarToken,
    subirFoto.single("foto"),
    async (req, res) => {

        try {

            const {
                id_categoria,
                titulo,
                descripcion,
                direccion,
                latitud,
                longitud
            } = req.body;

            if (
                !id_categoria ||
                !titulo ||
                !descripcion ||
                !direccion
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Completá todos los datos del reporte"
                });
            }

            let foto = null;

            if (req.file) {
                foto =
                    `/uploads/reportes/${req.file.filename}`;
            }

            const [resultado] =
                await conexion.query(
                    `INSERT INTO reportes
                    (
                        id_usuario,
                        id_categoria,
                        id_estado,
                        titulo,
                        descripcion,
                        direccion,
                        latitud,
                        longitud,
                        foto
                    )
                    VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)`,
                    [
                        req.usuario.id_usuario,
                        id_categoria,
                        titulo,
                        descripcion,
                        direccion,
                        latitud || null,
                        longitud || null,
                        foto
                    ]
                );

            res.status(201).json({
                ok: true,
                mensaje:
                    "Reporte creado correctamente",
                id_reporte:
                    resultado.insertId
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje: "Error al crear el reporte"
            });
        }
    }
);


// ========================================
// TODOS LOS REPORTES
// ========================================

router.get(
    "/todos",
    verificarToken,
    async (req, res) => {

        try {

            const [reportes] =
                await conexion.query(
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

                        e.nombre AS estado,

                        CONCAT(
                            u.nombre,
                            ' ',
                            u.apellido
                        ) AS vecino,

                        (
                            SELECT COUNT(*)
                            FROM apoyos a
                            WHERE a.id_reporte =
                            r.id_reporte
                        ) AS apoyos

                    FROM reportes r

                    INNER JOIN categorias c
                        ON r.id_categoria =
                        c.id_categoria

                    INNER JOIN estados e
                        ON r.id_estado =
                        e.id_estado

                    INNER JOIN usuarios u
                        ON r.id_usuario =
                        u.id_usuario

                    ORDER BY
                        r.fecha_reporte DESC`
                );

            res.json({
                ok: true,
                reportes
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron obtener los reportes"
            });
        }
    }
);


// ========================================
// MIS REPORTES
// ========================================

router.get(
    "/mis-reportes",
    verificarToken,
    async (req, res) => {

        try {

            const [reportes] =
                await conexion.query(
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
                        e.nombre AS estado,

                        (
                            SELECT COUNT(*)
                            FROM apoyos a
                            WHERE a.id_reporte =
                            r.id_reporte
                        ) AS apoyos

                    FROM reportes r

                    INNER JOIN categorias c
                        ON r.id_categoria =
                        c.id_categoria

                    INNER JOIN estados e
                        ON r.id_estado =
                        e.id_estado

                    WHERE r.id_usuario = ?

                    ORDER BY
                        r.fecha_reporte DESC`,
                    [req.usuario.id_usuario]
                );

            res.json({
                ok: true,
                reportes
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron obtener tus reportes"
            });
        }
    }
);


// ========================================
// DETALLE DE REPORTE
// ========================================

router.get(
    "/:id",
    verificarToken,
    async (req, res) => {

        try {

            const id = req.params.id;

            const [reportes] =
                await conexion.query(
                    `SELECT
                        r.*,

                        c.nombre AS categoria,

                        e.nombre AS estado,

                        CONCAT(
                            u.nombre,
                            ' ',
                            u.apellido
                        ) AS vecino

                    FROM reportes r

                    INNER JOIN categorias c
                        ON r.id_categoria =
                        c.id_categoria

                    INNER JOIN estados e
                        ON r.id_estado =
                        e.id_estado

                    INNER JOIN usuarios u
                        ON r.id_usuario =
                        u.id_usuario

                    WHERE r.id_reporte = ?`,
                    [id]
                );

            if (reportes.length === 0) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "Reporte no encontrado"
                });
            }

            const [comentarios] =
                await conexion.query(
                    `SELECT
                        c.id_comentario,
                        c.comentario,
                        c.fecha_comentario,

                        CONCAT(
                            u.nombre,
                            ' ',
                            u.apellido
                        ) AS usuario

                    FROM comentarios c

                    INNER JOIN usuarios u
                        ON c.id_usuario =
                        u.id_usuario

                    WHERE c.id_reporte = ?

                    ORDER BY
                        c.fecha_comentario ASC`,
                    [id]
                );

            const [apoyos] =
                await conexion.query(
                    `SELECT COUNT(*) AS cantidad
                     FROM apoyos
                     WHERE id_reporte = ?`,
                    [id]
                );

            res.json({
                ok: true,
                reporte: reportes[0],
                comentarios,
                apoyos: apoyos[0].cantidad
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo obtener el reporte"
            });
        }
    }
);


// ========================================
// APOYAR REPORTE
// ========================================

router.post(
    "/:id/apoyar",
    verificarToken,
    async (req, res) => {

        try {

            const idReporte = req.params.id;
            const idUsuario =
                req.usuario.id_usuario;

            const [existente] =
                await conexion.query(
                    `SELECT id_apoyo
                     FROM apoyos
                     WHERE id_reporte = ?
                     AND id_usuario = ?`,
                    [
                        idReporte,
                        idUsuario
                    ]
                );

            if (existente.length > 0) {

                await conexion.query(
                    `DELETE FROM apoyos
                     WHERE id_reporte = ?
                     AND id_usuario = ?`,
                    [
                        idReporte,
                        idUsuario
                    ]
                );

                return res.json({
                    ok: true,
                    apoyado: false,
                    mensaje:
                        "Quitaste tu apoyo"
                });
            }

            await conexion.query(
                `INSERT INTO apoyos
                (id_reporte, id_usuario)
                VALUES (?, ?)`,
                [
                    idReporte,
                    idUsuario
                ]
            );

            res.json({
                ok: true,
                apoyado: true,
                mensaje:
                    "Apoyaste el reporte"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo apoyar el reporte"
            });
        }
    }
);


// ========================================
// COMENTAR
// ========================================

router.post(
    "/:id/comentarios",
    verificarToken,
    async (req, res) => {

        try {

            const idReporte =
                req.params.id;

            const comentario =
                req.body.comentario;

            if (!comentario) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Escribí un comentario"
                });
            }

            await conexion.query(
                `INSERT INTO comentarios
                (
                    id_reporte,
                    id_usuario,
                    comentario
                )
                VALUES (?, ?, ?)`,
                [
                    idReporte,
                    req.usuario.id_usuario,
                    comentario
                ]
            );

            res.json({
                ok: true,
                mensaje:
                    "Comentario agregado"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo agregar el comentario"
            });
        }
    }
);


module.exports = router;