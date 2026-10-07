require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de SAC funcionando",
    fecha: new Date().toISOString()
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/categorias", require("./routes/categorias"));
app.use("/api/perfil", require("./routes/perfil"));
app.use("/api/notificaciones", require("./routes/notificaciones"));
app.use("/api/reportes", require("./routes/reportes"));
app.use("/api/admin", require("./routes/admin"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor"
  });
});

function iniciarServidor(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port === DEFAULT_PORT) {
      console.warn(`Puerto ${port} ocupado. Reintentando en ${port + 1}...`);
      iniciarServidor(port + 1);
      return;
    }

    throw error;
  });
}

iniciarServidor(DEFAULT_PORT);
