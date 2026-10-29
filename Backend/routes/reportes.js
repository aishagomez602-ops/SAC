const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const conexion = require("../db");
const {
    verificarToken,
    verificarRol
} = require("../middleware/auth");

const router = express.Router();
const verificarVecino = verificarRol("vecino");
const verificarVecinoOAdministrador = verificarRol("vecino", "administrador");


// ========================================
// CONFIGURACIÓN DE FOTOS
// ========================================

const directorioFotos = path.resolve(__dirname, "..", "uploads", "reportes");
const extensionesImagen = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp"
};

const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(directorioFotos, { recursive: true }, (error) => {
            cb(error, directorioFotos);
        });
    },

    filename: (req, file, cb) => {
        cb(null, `reporte_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${extensionesImagen[file.mimetype]}`);
    }
});

const subirFoto = multer({
    storage: almacenamiento,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!extensionesImagen[file.mimetype]) {
            cb(new Error("El archivo debe ser JPG, PNG, GIF o WEBP."));
            return;
        }
        cb(null, true);
    }
});


// ========================================
// CREAR REPORTE
// ========================================

router.post(
    "/crear",
    verificarToken,
    verificarVecino,
    subirFoto.single("foto"),
    async (req, res) => {
        let connection;
        try {

            const {
                id_categoria,
                titulo,
                descripcion,
                direccion,
                latitud,
                longitud
            } = req.body;
            const tituloLimpio = typeof titulo === "string" ? titulo.trim() : "";
            const descripcionLimpia = typeof descripcion === "string" ? descripcion.trim() : "";
            const direccionLimpia = typeof direccion === "string" ? direccion.trim() : "";
            const categoriaId = Number(id_categoria);
            const latitude = latitud === undefined || latitud === "" ? null : Number(latitud);
            const longitude = longitud === undefined || longitud === "" ? null : Number(longitud);

            if (
                !Number.isInteger(categoriaId) ||
                categoriaId <= 0 ||
                tituloLimpio.length < 5 ||
                tituloLimpio.length > 100 ||
                descripcionLimpia.length < 20 ||
                descripcionLimpia.length > 1000 ||
                direccionLimpia.length < 5 ||
                direccionLimpia.length > 150 ||
                (latitude === null) !== (longitude === null) ||
                (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
                (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
            ) {
                if (req.file) {
                    try {
                        await fs.promises.unlink(req.file.path);
                    } catch (cleanupError) {
                        if (cleanupError.code !== "ENOENT") {
                            console.error("No se pudo limpiar la foto del reporte inválido.", cleanupError);
                        }
                    }
                }
                return res.status(400).json({
                    ok: false,
                    mensaje: "La categoría es obligatoria; el título debe tener 5–100, la descripción 20–1000 y la dirección 5–150 caracteres"
                });
            }

            let foto = null;

            if (req.file) {
                foto =
                    `/uploads/reportes/${req.file.filename}`;
            }

            connection = await conexion.getConnection();
            await connection.beginTransaction();

            const [resultado] =
                await connection.query(
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
                        categoriaId,
                        tituloLimpio,
                        descripcionLimpia,
                        direccionLimpia,
                        latitude,
                        longitude,
                        foto
                    ]
                );

            await connection.query(
                `INSERT INTO aprobaciones_reportes
                (id_reporte, estado_revision)
                VALUES (?, 'pendiente')`,
                [resultado.insertId]
            );
            await connection.commit();

            res.status(201).json({
                ok: true,
                mensaje:
                    "Reporte enviado. Quedó pendiente de autorización administrativa.",
                id_reporte:
                    resultado.insertId
            });

        } catch (error) {
            if (connection) await connection.rollback();

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje: "Error al crear el reporte"
            });
        } finally {
            if (connection) connection.release();
        }
    }
);


// ========================================
// TODOS LOS REPORTES
// ========================================

router.get(
    "/todos",
    verificarToken,
    verificarVecinoOAdministrador,
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

                    INNER JOIN aprobaciones_reportes ar
                        ON ar.id_reporte = r.id_reporte
                        AND ar.estado_revision = 'aprobado'

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
    verificarVecinoOAdministrador,
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
                        COALESCE(ar.estado_revision, 'pendiente') AS estado_revision,

                        (
                            SELECT COUNT(*)
                            FROM apoyos a
                            WHERE a.id_reporte =
                            r.id_reporte
                        ) AS apoyos

                    FROM reportes r

                    LEFT JOIN aprobaciones_reportes ar
                        ON ar.id_reporte = r.id_reporte

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
    verificarVecinoOAdministrador,
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

            const [apoyos] =
                await conexion.query(
                    `SELECT COUNT(*) AS cantidad
                     FROM apoyos
                     WHERE id_reporte = ?`,
                    [id]
                );

            const [miApoyo] =
                await conexion.query(
                    `SELECT id_apoyo
                     FROM apoyos
                     WHERE id_reporte = ?
                     AND id_usuario = ?`,
                    [id, req.usuario.id_usuario]
                );

            res.json({
                ok: true,
                reporte: reportes[0],
                apoyos: apoyos[0].cantidad,
                apoyado: miApoyo.length > 0
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
    verificarVecino,
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


router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const mensaje = error.code === "LIMIT_FILE_SIZE"
            ? "La imagen no puede superar los 5 MB"
            : "No se pudo procesar la imagen adjunta";
        return res.status(status).json({ ok: false, mensaje });
    }

    if (error.message === "El archivo debe ser JPG, PNG, GIF o WEBP.") {
        return res.status(400).json({ ok: false, mensaje: error.message });
    }

    next(error);
});

module.exports = router;