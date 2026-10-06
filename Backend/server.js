require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
