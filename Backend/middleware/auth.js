const jwt = require("jsonwebtoken");
const conexion = require("../db");

function verificarToken(req, res, next) {

    const autorizacion = req.headers.authorization;

    if (!autorizacion) {
        return res.status(401).json({
            ok: false,
            mensaje: "No estás autenticado"
        });
    }

    const partes = autorizacion.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            ok: false,
            mensaje: "Token inválido"
        });
    }

    const token = partes[1];

    try {

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = datos;

        next();

    } catch (error) {

        return res.status(401).json({
            ok: false,
            mensaje: "El token es inválido o venció"
        });
    }
}

async function verificarAdministrador(req, res, next) {

    try {
        const [usuarios] = await conexion.query(
            `SELECT rol
             FROM usuarios
             WHERE id_usuario = ?`,
            [req.usuario.id_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: "El usuario ya no existe"
            });
        }

        if (usuarios[0].rol !== "administrador") {
            return res.status(403).json({
                ok: false,
                mensaje: "No tenés permisos de administrador"
            });
        }

        req.usuario.rol = usuarios[0].rol;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo verificar el rol de administrador"
        });
    }
}

module.exports = {
    verificarToken,
    verificarAdministrador
};