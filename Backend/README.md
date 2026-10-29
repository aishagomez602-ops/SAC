# Configuración del backend

1. En el archivo local `Backend/.env`, completá la conexión a MySQL, un `JWT_SECRET` seguro y la configuración SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM` y, si el servidor lo requiere, `SMTP_USER` y `SMTP_PASS`). No subas ese archivo al repositorio.
2. Aplicá una sola vez `migrations/002_roles_y_verificacion_email.sql` sobre la base configurada. La migración habilita el rol `area_municipal` y crea los desafíos temporales de verificación.
3. Aplicá una sola vez `migrations/003_recuperacion_contrasena.sql` para habilitar la recuperación de contraseña por correo.
4. Iniciá la aplicación con `npm run dev` desde la raíz. El lanzador elige un puerto libre para la API y configura el proxy del frontend con ese mismo puerto. El inicio de sesión solo emite una sesión después de verificar el código enviado por correo.

La opción «¿Necesitás ayuda para ingresar?» permite restablecer la contraseña con un código enviado al correo registrado. El rol de área municipal se asigna desde el panel de administración. Ese rol puede consultar reportes y actualizar su estado; no puede usar las funciones vecinales ni las administrativas.
