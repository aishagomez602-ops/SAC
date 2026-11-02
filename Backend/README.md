# Configuración del backend

1. En el archivo local `Backend/.env`, completá la conexión a MySQL y un `JWT_SECRET` seguro. La configuración SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM` y, si el servidor lo requiere, `SMTP_USER` y `SMTP_PASS`) solo se usa para la recuperación de contraseña. No subas ese archivo al repositorio.
2. Aplicá una sola vez `migrations/002_roles_y_verificacion_email.sql` sobre la base configurada. La migración habilita el rol `area_municipal` y crea la tabla histórica de desafíos de acceso, que ya no se usa para iniciar sesión.
3. Aplicá una sola vez `migrations/003_recuperacion_contrasena.sql` para habilitar la recuperación de contraseña por correo.
4. Aplicá una sola vez `migrations/004_ampliar_email_usuarios.sql` para que la base acepte correos de hasta 254 caracteres, como ya permite el formulario y valida la API.
5. Iniciá la aplicación con `npm run dev` desde la raíz. El lanzador elige un puerto libre para la API y configura el proxy del frontend con ese mismo puerto. Para iniciar sesión, alcanza con ingresar el correo y la contraseña correctos.

Las contraseñas nuevas deben tener entre 12 y 72 caracteres e incluir mayúsculas, minúsculas, números y símbolos; también deben respetar el límite de 72 bytes de bcrypt. Las cuentas existentes pueden seguir iniciando sesión con su contraseña actual. La opción «¿Necesitás ayuda para ingresar?» permite restablecerla con un código enviado al correo registrado. El rol de área municipal se asigna desde el panel de administración. Ese rol puede consultar reportes y actualizar su estado; no puede usar las funciones vecinales ni las administrativas.
