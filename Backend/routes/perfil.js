const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const crypto = require("crypto");

const conexion = require("../db");
const { verificarToken, verificarRol } =
    require("../middleware/auth");

const router = express.Router();
const verificarUsuarioNoMunicipal = verificarRol("vecino", "administrador");
const directorioFotos = path.resolve(__dirname, "..", "uploads", "perfiles");
const extensionesImagen = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp"
};
const subirFoto = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdir(directorioFotos, { recursive: true }, (error) => {
                cb(error, directorioFotos);
            });
        },
        filename: (req, file, cb) => {
            cb(null, `perfil_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${extensionesImagen[file.mimetype]}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!extensionesImagen[file.mimetype]) {
            cb(new Error("La foto debe ser JPG, PNG, GIF o WEBP."));
            return;
        }
        cb(null, true);
    }
});

async function removeProfilePhoto(photoUrl) {
    if (typeof photoUrl !== "string" || !photoUrl.startsWith("/uploads/perfiles/")) return;
    const photoPath = path.resolve(directorioFotos, path.basename(photoUrl));
    if (!photoPath.startsWith(`${directorioFotos}${path.sep}`)) return;

    try {
        await fsPromises.unlink(photoPath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("No se pudo eliminar la foto de perfil anterior.", error);
        }
    }
}


// ========================================
// EDITAR PERFIL
// ========================================

router.put(
    "/editar",
    verificarToken,
    verificarUsuarioNoMunicipal,
    subirFoto.single("foto"),
    async (req, res) => {

        try {

            const {
                nombre,
                apellido,
                email
            } = req.body;
            const nombreLimpio = typeof nombre === "string" ? nombre.trim() : "";
            const apellidoLimpio = typeof apellido === "string" ? apellido.trim() : "";
            const emailLimpio = typeof email === "string" ? email.trim().toLowerCase() : "";

            if (
                nombreLimpio.length < 2 ||
                nombreLimpio.length > 50 ||
                apellidoLimpio.length < 2 ||
                apellidoLimpio.length > 50 ||
                emailLimpio.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)
            ) {
                if (req.file) await fsPromises.unlink(req.file.path);
                return res.status(400).json({
                    ok: false,
                    mensaje: "El nombre y apellido deben tener 2–50 caracteres y el correo debe ser válido"
                });
            }

            const [existente] =
                await conexion.query(
                    `SELECT id_usuario
                     FROM usuarios
                     WHERE email = ?
                     AND id_usuario <> ?`,
                    [
                        emailLimpio,
                        req.usuario.id_usuario
                    ]
                );

            if (existente.length > 0) {
                if (req.file) await fsPromises.unlink(req.file.path);

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Ese email ya está utilizado"
                });
            }

            const [usuarios] = await conexion.query(
                "SELECT foto FROM usuarios WHERE id_usuario = ?",
                [req.usuario.id_usuario]
            );
            if (usuarios.length === 0) {
                if (req.file) await fsPromises.unlink(req.file.path);
                return res.status(404).json({
                    ok: false,
                    mensaje: "Usuario no encontrado"
                });
            }

            const foto = req.file
                ? `/uploads/perfiles/${req.file.filename}`
                : usuarios[0].foto;
            await conexion.query(
                `UPDATE usuarios
                 SET nombre = ?,
                     apellido = ?,
                     email = ?,
                     foto = ?
                 WHERE id_usuario = ?`,
                [
                    nombreLimpio,
                    apellidoLimpio,
                    emailLimpio,
                    foto,
                    req.usuario.id_usuario
                ]
            );

            if (req.file && usuarios[0].foto !== foto) {
                await removeProfilePhoto(usuarios[0].foto);
            }

            res.json({
                ok: true,
                mensaje:
                    "Perfil actualizado correctamente",
                usuario: {
                    id_usuario: req.usuario.id_usuario,
                    nombre: nombreLimpio,
                    apellido: apellidoLimpio,
                    email: emailLimpio,
                    foto
                }
            });

        } catch (error) {

            if (req.file) {
                try {
                    await fsPromises.unlink(req.file.path);
                } catch (cleanupError) {
                    if (cleanupError.code !== "ENOENT") console.error("No se pudo limpiar la foto de perfil nueva.", cleanupError);
                }
            }
            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo actualizar el perfil"
            });
        }
    }
);


// ========================================
// CAMBIAR CONTRASEÑA
// ========================================

router.put(
    "/contrasena",
    verificarToken,
    verificarUsuarioNoMunicipal,
    async (req, res) => {

        try {

            const {
                contrasenaActual,
                contrasenaNueva
            } = req.body;

            if (
                typeof contrasenaActual !== "string" ||
                typeof contrasenaNueva !== "string" ||
                contrasenaActual.length === 0 ||
                contrasenaNueva.length < 8 ||
                contrasenaNueva.length > 72 ||
                Buffer.byteLength(contrasenaNueva, "utf8") > 72
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Ingresá la contraseña actual y una nueva de 8–72 caracteres"
                });
            }

            const [usuarios] =
                await conexion.query(
                    `SELECT contrasena
                     FROM usuarios
                     WHERE id_usuario = ?`,
                    [req.usuario.id_usuario]
                );

            if (usuarios.length === 0) {

                return res.status(404).json({
                    ok: false,
                    mensaje:
                        "Usuario no encontrado"
                });
            }

            const correcta =
                await bcrypt.compare(
                    contrasenaActual,
                    usuarios[0].contrasena
                );

            if (!correcta) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "La contraseña actual es incorrecta"
                });
            }

            const nueva =
                await bcrypt.hash(
                    contrasenaNueva,
                    10
                );

            await conexion.query(
                `UPDATE usuarios
                 SET contrasena = ?
                 WHERE id_usuario = ?`,
                [
                    nueva,
                    req.usuario.id_usuario
                ]
            );

            res.json({
                ok: true,
                mensaje:
                    "Contraseña actualizada"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                mensaje:
                    "No se pudo cambiar la contraseña"
            });
        }
    }
);

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({
            ok: false,
            mensaje: error.code === "LIMIT_FILE_SIZE"
                ? "La foto no puede superar los 5 MB"
                : "No se pudo procesar la foto de perfil"
        });
    }
    if (error.message === "La foto debe ser JPG, PNG, GIF o WEBP.") {
        return res.status(400).json({ ok: false, mensaje: error.message });
    }
    next(error);
});


module.exports = router;