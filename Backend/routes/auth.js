const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const conexion = require("../db");
const { verificarToken } = require("../middleware/auth");
const { enviarCodigoInicioSesion, enviarCodigoRecuperacion } = require("../email");

const router = express.Router();

function hashCodigo(desafio, codigo) {
    return crypto
        .createHmac("sha256", process.env.JWT_SECRET)
        .update(`${desafio}:${codigo}`)
        .digest("hex");
}

// ===============================
// REGISTRO
// ===============================

router.post("/registro", async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            email,
            contrasena
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
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio) ||
            typeof contrasena !== "string" ||
            contrasena.length < 8 ||
            contrasena.length > 72 ||
            Buffer.byteLength(contrasena, "utf8") > 72
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre y apellido deben tener 2–50 caracteres; el correo debe ser válido y la contraseña debe tener 8–72 caracteres"
            });
        }

        const [usuarios] = await conexion.query(
            "SELECT id_usuario FROM usuarios WHERE email = ?",
            [emailLimpio]
        );

        if (usuarios.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El email ya está registrado"
            });
        }

        const contrasenaEncriptada =
            await bcrypt.hash(contrasena, 10);

        const [resultado] = await conexion.query(
            `INSERT INTO usuarios
            (nombre, apellido, email, contrasena, rol)
            VALUES (?, ?, ?, ?, 'vecino')`,
            [
                nombreLimpio,
                apellidoLimpio,
                emailLimpio,
                contrasenaEncriptada
            ]
        );

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado correctamente",
            usuario: {
                id_usuario: resultado.insertId,
                nombre: nombreLimpio,
                apellido: apellidoLimpio,
                email: emailLimpio,
                rol: "vecino"
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});


// ===============================
// LOGIN
// ===============================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            contrasena
        } = req.body;

        if (
            typeof email !== "string" ||
            typeof contrasena !== "string" ||
            !email.trim() ||
            email.trim().length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            !contrasena ||
            contrasena.length > 72 ||
            Buffer.byteLength(contrasena, "utf8") > 72
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Ingresá un correo válido y una contraseña de hasta 72 caracteres"
            });
        }

        const [usuarios] = await conexion.query(
            `SELECT *
             FROM usuarios
             WHERE email = ?`,
            [email.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const usuario = usuarios[0];

        const contraseñaCorrecta =
            await bcrypt.compare(
                contrasena,
                usuario.contrasena
            );

        if (!contraseñaCorrecta) {
            return res.status(401).json({
                ok: false,
                mensaje: "Email o contraseña incorrectos"
            });
        }

        const [desafiosAnteriores] = await conexion.query(
            `SELECT creado_en
             FROM desafios_acceso
             WHERE id_usuario = ?
             ORDER BY creado_en DESC
             LIMIT 1`,
            [usuario.id_usuario]
        );
        if (
            desafiosAnteriores.length > 0 &&
            Date.now() - new Date(desafiosAnteriores[0].creado_en).getTime() < 60_000
        ) {
            return res.status(429).json({
                ok: false,
                mensaje: "Esperá un minuto antes de solicitar otro código"
            });
        }

        await conexion.query(
            "DELETE FROM desafios_acceso WHERE id_usuario = ?",
            [usuario.id_usuario]
        );

        const desafio = crypto.randomBytes(32).toString("hex");
        const codigo = crypto.randomInt(100000, 1000000).toString();
        await conexion.query(
            `INSERT INTO desafios_acceso (id_desafio, id_usuario, codigo_hash, vence_en)
             VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
            [
                crypto.createHash("sha256").update(desafio).digest("hex"),
                usuario.id_usuario,
                hashCodigo(desafio, codigo)
            ]
        );

        try {
            await enviarCodigoInicioSesion(usuario.email, codigo);
        } catch (error) {
            await conexion.query("DELETE FROM desafios_acceso WHERE id_desafio = ?", [
                crypto.createHash("sha256").update(desafio).digest("hex")
            ]);
            console.error("No se pudo enviar el código de inicio de sesión.", error.message);
            return res.status(503).json({
                ok: false,
                mensaje: "No se pudo enviar el código por correo. Revisá la configuración del servicio de email e intentá nuevamente."
            });
        }

        return res.json({
            ok: true,
            mensaje: "Te enviamos un código de verificación a tu correo",
            requiere_verificacion: true,
            desafio,
            email: usuario.email
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});

router.post("/verificar-codigo", async (req, res) => {
    const desafio = typeof req.body.desafio === "string" ? req.body.desafio : "";
    const codigo = typeof req.body.codigo === "string" ? req.body.codigo.trim() : "";
    if (!/^[a-f0-9]{64}$/i.test(desafio) || !/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Ingresá el código de seis dígitos que recibiste por correo"
        });
    }

    let connection;
    try {
        connection = await conexion.getConnection();
        await connection.beginTransaction();

        const idDesafio = crypto.createHash("sha256").update(desafio).digest("hex");
        const [desafios] = await connection.query(
            `SELECT d.id_desafio, d.id_usuario, d.codigo_hash, d.intentos, d.vence_en,
                    u.email, u.nombre, u.apellido, u.foto, u.rol, u.fecha_registro
             FROM desafios_acceso d
             INNER JOIN usuarios u ON u.id_usuario = d.id_usuario
             WHERE d.id_desafio = ?
             FOR UPDATE`,
            [idDesafio]
        );

        if (desafios.length === 0) {
            await connection.rollback();
            return res.status(401).json({
                ok: false,
                mensaje: "El código venció o ya fue utilizado. Iniciá sesión nuevamente."
            });
        }

        const desafioActual = desafios[0];
        if (new Date(desafioActual.vence_en).getTime() <= Date.now()) {
            await connection.query("DELETE FROM desafios_acceso WHERE id_desafio = ?", [idDesafio]);
            await connection.commit();
            return res.status(401).json({
                ok: false,
                mensaje: "El código venció. Iniciá sesión nuevamente."
            });
        }

        const codigoEsperado = Buffer.from(desafioActual.codigo_hash, "hex");
        const codigoRecibido = Buffer.from(hashCodigo(desafio, codigo), "hex");
        const codigoCorrecto =
            codigoEsperado.length === codigoRecibido.length &&
            crypto.timingSafeEqual(codigoEsperado, codigoRecibido);

        if (!codigoCorrecto) {
            const intentos = desafioActual.intentos + 1;
            if (intentos >= 5) {
                await connection.query("DELETE FROM desafios_acceso WHERE id_desafio = ?", [idDesafio]);
            } else {
                await connection.query(
                    "UPDATE desafios_acceso SET intentos = ? WHERE id_desafio = ?",
                    [intentos, idDesafio]
                );
            }
            await connection.commit();
            return res.status(401).json({
                ok: false,
                mensaje: intentos >= 5
                    ? "Se agotaron los intentos. Iniciá sesión nuevamente."
                    : `El código es incorrecto. Te quedan ${5 - intentos} intentos.`
            });
        }

        await connection.query("DELETE FROM desafios_acceso WHERE id_desafio = ?", [idDesafio]);
        await connection.commit();

        const usuario = {
            id_usuario: desafioActual.id_usuario,
            email: desafioActual.email,
            nombre: desafioActual.nombre,
            apellido: desafioActual.apellido,
            foto: desafioActual.foto,
            rol: desafioActual.rol,
            fecha_registro: desafioActual.fecha_registro
        };
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        return res.json({
            ok: true,
            mensaje: "Inicio de sesión confirmado",
            token,
            usuario
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo verificar el código"
        });
    } finally {
        if (connection) connection.release();
    }
});

router.post("/solicitar-recuperacion", async (req, res) => {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Ingresá un correo electrónico válido"
        });
    }

    let desafio;
    let idDesafio;
    let correo;
    try {
        const [usuarios] = await conexion.query(
            "SELECT id_usuario, email FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            const [recientes] = await conexion.query(
                `SELECT creado_en
                 FROM desafios_recuperacion
                 WHERE id_usuario = ?
                 ORDER BY creado_en DESC
                 LIMIT 1`,
                [usuario.id_usuario]
            );
            if (
                recientes.length > 0 &&
                Date.now() - new Date(recientes[0].creado_en).getTime() < 60_000
            ) {
                return res.status(429).json({
                    ok: false,
                    mensaje: "Esperá un minuto antes de solicitar otro código"
                });
            }

            await conexion.query(
                "DELETE FROM desafios_recuperacion WHERE id_usuario = ?",
                [usuario.id_usuario]
            );

            desafio = crypto.randomBytes(32).toString("hex");
            idDesafio = crypto.createHash("sha256").update(desafio).digest("hex");
            const codigo = crypto.randomInt(100000, 1000000).toString();
            await conexion.query(
                `INSERT INTO desafios_recuperacion
                    (id_desafio, id_usuario, codigo_hash, vence_en)
                 VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
                [
                    idDesafio,
                    usuario.id_usuario,
                    crypto.createHmac("sha256", process.env.JWT_SECRET)
                        .update(`recuperacion:${desafio}:${codigo}`)
                        .digest("hex")
                ]
            );
            correo = usuario.email;

            try {
                await enviarCodigoRecuperacion(correo, codigo);
            } catch (error) {
                await conexion.query("DELETE FROM desafios_recuperacion WHERE id_desafio = ?", [idDesafio]);
                console.error("No se pudo enviar el código de recuperación.", error.message);
                return res.status(503).json({
                    ok: false,
                    mensaje: "No se pudo enviar el código por correo. Intentá nuevamente más tarde."
                });
            }
        } else {
            desafio = crypto.randomBytes(32).toString("hex");
        }

        return res.json({
            ok: true,
            mensaje: "Si el correo está registrado, recibirás un código de recuperación.",
            desafio
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo iniciar la recuperación de contraseña"
        });
    }
});

router.post("/restablecer-contrasena", async (req, res) => {
    const desafio = typeof req.body.desafio === "string" ? req.body.desafio : "";
    const codigo = typeof req.body.codigo === "string" ? req.body.codigo.trim() : "";
    const contrasena = typeof req.body.contrasena === "string" ? req.body.contrasena : "";

    if (
        !/^[a-f0-9]{64}$/i.test(desafio) ||
        !/^\d{6}$/.test(codigo) ||
        contrasena.length < 8 ||
        contrasena.length > 72 ||
        Buffer.byteLength(contrasena, "utf8") > 72
    ) {
        return res.status(400).json({
            ok: false,
            mensaje: "Ingresá un código válido y una nueva contraseña de 8–72 caracteres"
        });
    }

    let connection;
    try {
        connection = await conexion.getConnection();
        await connection.beginTransaction();

        const idDesafio = crypto.createHash("sha256").update(desafio).digest("hex");
        const [desafios] = await connection.query(
            `SELECT id_usuario, codigo_hash, intentos, vence_en
             FROM desafios_recuperacion
             WHERE id_desafio = ?
             FOR UPDATE`,
            [idDesafio]
        );
        if (desafios.length === 0) {
            await connection.rollback();
            return res.status(401).json({
                ok: false,
                mensaje: "El código venció o ya fue utilizado. Solicitá uno nuevo."
            });
        }

        const desafioActual = desafios[0];
        if (new Date(desafioActual.vence_en).getTime() <= Date.now()) {
            await connection.query("DELETE FROM desafios_recuperacion WHERE id_desafio = ?", [idDesafio]);
            await connection.commit();
            return res.status(401).json({
                ok: false,
                mensaje: "El código venció. Solicitá uno nuevo."
            });
        }

        const codigoEsperado = Buffer.from(desafioActual.codigo_hash, "hex");
        const codigoRecibido = Buffer.from(
            crypto.createHmac("sha256", process.env.JWT_SECRET)
                .update(`recuperacion:${desafio}:${codigo}`)
                .digest("hex"),
            "hex"
        );
        const codigoCorrecto =
            codigoEsperado.length === codigoRecibido.length &&
            crypto.timingSafeEqual(codigoEsperado, codigoRecibido);

        if (!codigoCorrecto) {
            const intentos = desafioActual.intentos + 1;
            if (intentos >= 5) {
                await connection.query("DELETE FROM desafios_recuperacion WHERE id_desafio = ?", [idDesafio]);
            } else {
                await connection.query(
                    "UPDATE desafios_recuperacion SET intentos = ? WHERE id_desafio = ?",
                    [intentos, idDesafio]
                );
            }
            await connection.commit();
            return res.status(401).json({
                ok: false,
                mensaje: intentos >= 5
                    ? "Se agotaron los intentos. Solicitá un nuevo código."
                    : `El código es incorrecto. Te quedan ${5 - intentos} intentos.`
            });
        }

        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
        await connection.query(
            "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
            [contrasenaEncriptada, desafioActual.id_usuario]
        );
        await connection.query(
            "DELETE FROM desafios_recuperacion WHERE id_usuario = ?",
            [desafioActual.id_usuario]
        );
        await connection.commit();

        return res.json({
            ok: true,
            mensaje: "Contraseña actualizada. Ya podés iniciar sesión."
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        return res.status(500).json({
            ok: false,
            mensaje: "No se pudo actualizar la contraseña"
        });
    } finally {
        if (connection) connection.release();
    }
});


// ===============================
// USUARIO ACTUAL
// ===============================

router.get("/usuario", verificarToken, async (req, res) => {

    try {

        const [usuarios] = await conexion.query(
            `SELECT
                id_usuario,
                nombre,
                apellido,
                email,
                foto,
                rol,
                fecha_registro
             FROM usuarios
             WHERE id_usuario = ?`,
            [req.usuario.id_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({
            ok: true,
            usuario: usuarios[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        });
    }
});


module.exports = router;