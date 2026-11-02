function esContrasenaSegura(contrasena) {
    return typeof contrasena === "string" &&
        contrasena.length >= 12 &&
        contrasena.length <= 72 &&
        Buffer.byteLength(contrasena, "utf8") <= 72 &&
        /\p{Lu}/u.test(contrasena) &&
        /\p{Ll}/u.test(contrasena) &&
        /\p{N}/u.test(contrasena) &&
        /[^\p{L}\p{N}\s]/u.test(contrasena);
}

module.exports = { esContrasenaSegura };
