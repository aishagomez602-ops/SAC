const nodemailer = require("nodemailer");

async function enviarCorreoCodigo(email, codigo, subject, purpose) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const from = process.env.SMTP_FROM;

    if (!host || !Number.isInteger(port) || port <= 0 || !from) {
        throw new Error("Falta configurar SMTP_HOST, SMTP_PORT y SMTP_FROM");
    }

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (Boolean(user) !== Boolean(pass)) {
        throw new Error("SMTP_USER y SMTP_PASS deben configurarse juntos");
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        ...(user ? { auth: { user, pass } } : {})
    });

    await transporter.sendMail({
        from,
        to: email,
        subject,
        text: `Tu código para ${purpose} en S.A.C. es ${codigo}. Vence en 10 minutos. Si no solicitaste este código, ignorá este correo.`
    });
}

function enviarCodigoInicioSesion(email, codigo) {
    return enviarCorreoCodigo(
        email,
        codigo,
        "Código para iniciar sesión en S.A.C.",
        "iniciar sesión"
    );
}

function enviarCodigoRecuperacion(email, codigo) {
    return enviarCorreoCodigo(
        email,
        codigo,
        "Código para recuperar tu contraseña de S.A.C.",
        "recuperar tu contraseña"
    );
}

module.exports = { enviarCodigoInicioSesion, enviarCodigoRecuperacion };
