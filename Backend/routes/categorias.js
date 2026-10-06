const express = require("express");
const conexion = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const [categorias] = await conexion.query(
            `SELECT *
             FROM categorias
             ORDER BY id_categoria`
        );

        res.json({
            ok: true,
            categorias
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudieron obtener las categorías"
        });
    }
});

module.exports = router;