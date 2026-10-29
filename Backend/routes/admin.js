const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const conexion = require("../db");

const {
    verificarToken,
    verificarAdministrador
} = require("../middleware/auth");
const { actualizarEstadoReporte } = require("../services/report-status");

const router = express.Router();

async function removeReport(connection, reportId) {
    const [reports] = await connection.query(
        `SELECT foto
         FROM reportes
         WHERE id_reporte = ?`,
        [reportId]
    );

    await connection.query(
        "DELETE FROM comentarios WHERE id_reporte = ?",
        [reportId]
    );
    await connection.query(
        "DELETE FROM apoyos WHERE id_reporte = ?",
        [reportId]
    );
    await connection.query(
        "DELETE FROM notificaciones WHERE id_reporte = ?",
        [reportId]
    );
    await connection.query(
        "DELETE FROM aprobaciones_reportes WHERE id_reporte = ?",
        [reportId]
    );
    await connection.query(
        "DELETE FROM reportes WHERE id_reporte = ?",
        [reportId]
    );

    return reports[0]?.foto || null;
}

async function removeReportPhoto(photoUrl) {
    if (typeof photoUrl !== "string" || !photoUrl.startsWith("/uploads/reportes/")) return;

    const photoName = path.basename(photoUrl);
    if (!photoName) return;

    const photoPath = path.resolve(__dirname, "..", "uploads", "reportes", photoName);
    const uploadDirectory = path.resolve(__dirname, "..", "uploads", "reportes");
    if (!photoPath.startsWith(`${uploadDirectory}${path.sep}`)) return;

    try {
        await fs.unlink(photoPath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("No se pudo eliminar el archivo de foto del reporte.", error);
        }
    }
}

router.get(
    "/reportes",
    verificarToken,
    verificarAdministrador,
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
                    r.id_usuario,
                    c.nombre AS categoria,
                    e.nombre AS estado,
                    CONCAT(u.nombre, ' ', u.apellido) AS vecino,
                    COALESCE(ar.estado_revision, 'pendiente') AS estado_revision
                 FROM reportes r
                 INNER JOIN categorias c ON r.id_categoria = c.id_categoria
                 INNER JOIN estados e ON r.id_estado = e.id_estado
                 INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
                 LEFT JOIN aprobaciones_reportes ar ON ar.id_reporte = r.id_reporte
                 ORDER BY r.fecha_reporte DESC`
            );

            res.json({ ok: true, reportes });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                ok: false,
                mensaje: "No se pudieron obtener los reportes para revisar"
            });
        }
    }
);

router.delete(
    "/reportes/:id",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {
        const reportId = Number(req.params.id);
        if (!Number.isInteger(reportId) || reportId <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El identificador del reporte no es válido"
            });
        }

        let connection;
        try {
            connection = await conexion.getConnection();
            await connection.beginTransaction();

            const [existingReports] = await connection.query(
                "SELECT id_reporte FROM reportes WHERE id_reporte = ? FOR UPDATE",
                [reportId]
            );
            if (existingReports.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    ok: false,
                    mensaje: "Reporte no encontrado"
                });
            }

            const photoUrl = await removeReport(connection, reportId);
            await connection.commit();
            await removeReportPhoto(photoUrl);
            return res.json({
                ok: true,
                mensaje: "Reporte y sus datos relacionados eliminados"
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudo eliminar el reporte"
            });
        } finally {
            if (connection) connection.release();
        }
    }
);

router.put(
    "/reportes/:id/aprobacion",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {
        try {
            const { decision } = req.body;
            if (!["aprobado", "rechazado"].includes(decision)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La decisión debe ser aprobado o rechazado"
                });
            }

            const [reportes] = await conexion.query(
                `SELECT id_reporte, id_usuario
                 FROM reportes
                 WHERE id_reporte = ?`,
                [req.params.id]
            );
            if (reportes.length === 0) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "Reporte no encontrado"
                });
            }

            await conexion.query(
                `INSERT INTO aprobaciones_reportes
                    (id_reporte, estado_revision, id_administrador, fecha_revision)
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                    estado_revision = VALUES(estado_revision),
                    id_administrador = VALUES(id_administrador),
                    fecha_revision = VALUES(fecha_revision)`,
                [req.params.id, decision, req.usuario.id_usuario]
            );

            await conexion.query(
                `INSERT INTO notificaciones
                    (id_usuario, id_reporte, tipo, mensaje)
                 VALUES (?, ?, 'estado', ?)`,
                [
                    reportes[0].id_usuario,
                    req.params.id,
                    decision === "aprobado"
                        ? "Tu reporte fue aprobado y ya está publicado."
                        : "Tu reporte no fue aprobado para su publicación."
                ]
            );

            res.json({
                ok: true,
                mensaje: decision === "aprobado"
                    ? "Reporte aprobado y publicado"
                    : "Reporte rechazado"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                ok: false,
                mensaje: "No se pudo guardar la decisión del reporte"
            });
        }
    }
);


// ========================================
// VER ESTADOS DISPONIBLES
// ========================================

router.get(
    "/estados",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {

        try {

            const [estados] =
                await conexion.query(
                    `SELECT id_estado, nombre
                     FROM estados
                     ORDER BY id_estado`
                );

            res.json({
                ok: true,
                estados
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudieron obtener los estados"
            });
        }
    }
);

router.delete(
    "/usuarios/:id",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El identificador del usuario no es válido"
            });
        }

        if (userId === Number(req.usuario.id_usuario)) {
            return res.status(400).json({
                ok: false,
                mensaje: "No podés eliminar tu propia cuenta de administrador"
            });
        }

        let connection;
        try {
            connection = await conexion.getConnection();
            await connection.beginTransaction();

            const [users] = await connection.query(
                "SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ? FOR UPDATE",
                [userId]
            );
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    ok: false,
                    mensaje: "Usuario no encontrado"
                });
            }

            if (users[0].rol === "administrador") {
                const [admins] = await connection.query(
                    "SELECT id_usuario FROM usuarios WHERE rol = 'administrador' FOR UPDATE"
                );
                if (admins.length <= 1) {
                    await connection.rollback();
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No se puede eliminar al último administrador"
                    });
                }
            }

            const [userReports] = await connection.query(
                "SELECT id_reporte FROM reportes WHERE id_usuario = ?",
                [userId]
            );
            const photos = [];
            for (const report of userReports) {
                const photo = await removeReport(connection, report.id_reporte);
                if (photo) photos.push(photo);
            }

            await connection.query("DELETE FROM comentarios WHERE id_usuario = ?", [userId]);
            await connection.query("DELETE FROM apoyos WHERE id_usuario = ?", [userId]);
            await connection.query("DELETE FROM notificaciones WHERE id_usuario = ?", [userId]);
            await connection.query("DELETE FROM contacto WHERE id_usuario = ?", [userId]);
            await connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [userId]);
            await connection.commit();

            for (const photo of photos) await removeReportPhoto(photo);
            return res.json({
                ok: true,
                mensaje: "Usuario y sus datos relacionados eliminados"
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudo eliminar el usuario"
            });
        } finally {
            if (connection) connection.release();
        }
    }
);


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

router.get(
    "/contacto",
    verificarToken,
    verificarAdministrador,
    async (req, res) => {
        try {
            const [consultas] = await conexion.query(
                `SELECT
                    c.id_contacto,
                    c.asunto,
                    c.mensaje,
                    c.fecha_contacto,
                    CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                    u.email
                 FROM contacto c
                 INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
                 ORDER BY c.fecha_contacto DESC`
            );

            return res.json({ ok: true, consultas });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudieron obtener las consultas de contacto"
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
        const userId = Number(req.params.id);
        const { rol } = req.body;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El identificador del usuario no es válido"
            });
        }

        if (!["vecino", "administrador", "area_municipal"].includes(rol)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Rol inválido"
            });
        }

        if (userId === Number(req.usuario.id_usuario) && rol !== "administrador") {
            return res.status(400).json({
                ok: false,
                mensaje: "No podés cambiar tu propio rol de administrador"
            });
        }

        let connection;
        try {
            connection = await conexion.getConnection();
            await connection.beginTransaction();

            const [users] = await connection.query(
                "SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ? FOR UPDATE",
                [userId]
            );
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    ok: false,
                    mensaje: "Usuario no encontrado"
                });
            }

            if (users[0].rol === "administrador" && rol !== "administrador") {
                const [admins] = await connection.query(
                    "SELECT id_usuario FROM usuarios WHERE rol = 'administrador' FOR UPDATE"
                );
                if (admins.length <= 1) {
                    await connection.rollback();
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No se puede quitar el rol al último administrador"
                    });
                }
            }

            await connection.query(
                `UPDATE usuarios
                 SET rol = ?
                 WHERE id_usuario = ?`,
                [rol, userId]
            );

            await connection.commit();
            res.json({
                ok: true,
                mensaje: "Rol actualizado correctamente"
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error(error);
            res.status(500).json({
                ok: false,
                mensaje: "No se pudo cambiar el rol"
            });
        } finally {
            if (connection) connection.release();
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
            const estado = await actualizarEstadoReporte(req.params.id, req.body.id_estado);
            return res.json({
                ok: true,
                mensaje: `Estado actualizado correctamente: ${estado.nombre}`
            });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ ok: false, mensaje: error.message });
            }
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: "No se pudo actualizar el estado"
            });
        }
    }
);


module.exports = router;