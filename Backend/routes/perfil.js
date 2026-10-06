const express = require("express");
const bcrypt = require("bcryptjs");

const conexion = require("../db");
const { verificarToken } =
    require("../middleware/auth");

const router = express.Router();


// ========================================
// EDITAR PERFIL
// ========================================

router.put(
    "/editar",
    verificarToken,
    async (req, res) => {

        try {

            const {
                nombre,
                apellido,
                email
            } = req.body;

            if (
                !nombre ||
                !apellido ||
                !email
            ) {
                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Completá todos los campos"
                });
            }

            const [existente] =
                await conexion.query(
                    `SELECT id_usuario
                     FROM usuarios
                     WHERE email = ?
                     AND id_usuario <> ?`,
                    [
                        email,
                        req.usuario.id_usuario
                    ]
                );

            if (existente.length > 0) {

                return res.status(400).json({
                    ok: false,
                    mensaje:
                        "Ese email ya está utilizado"
                });
            }

            await conexion.query(
                `UPDATE usuarios
                 SET nombre = ?,
                     apellido = ?,
                     email = ?
                 WHERE id_usuario = ?`,
                [
                    nombre,
                    apellido,
                    email,
                    req.usuario.id_usuario
                ]
            );

            res.json({
                ok: true,
                mensaje:
                    "Perfil actualizado correctamente"
            });

        } catch (error) {

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
    async (req, res) => {

        try {

            const {
                contrasenaActual,
                contrasenaNueva
            } = req.body;

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


module.exports = router;