const jwt = require("jsonwebtoken");

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

function verificarAdministrador(req, res, next) {

    if (req.usuario.rol !== "administrador") {
        return res.status(403).json({
            ok: false,
            mensaje: "No tenés permisos de administrador"
        });
    }

    next();
}

module.exports = {
    verificarToken,
    verificarAdministrador
};