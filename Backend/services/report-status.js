const conexion = require("../db");

async function actualizarEstadoReporte(reportId, statusId) {
    const idReporte = Number(reportId);
    const idEstado = Number(statusId);

    if (!Number.isInteger(idReporte) || idReporte <= 0) {
        const error = new Error("El identificador del reporte no es válido");
        error.status = 400;
        throw error;
    }

    if (!Number.isInteger(idEstado) || idEstado <= 0) {
        const error = new Error("Seleccioná un estado válido");
        error.status = 400;
        throw error;
    }

    const connection = await conexion.getConnection();
    try {
        await connection.beginTransaction();

        const [reports] = await connection.query(
            "SELECT id_usuario FROM reportes WHERE id_reporte = ? FOR UPDATE",
            [idReporte]
        );
        if (reports.length === 0) {
            const error = new Error("Reporte no encontrado");
            error.status = 404;
            throw error;
        }

        const [states] = await connection.query(
            "SELECT nombre FROM estados WHERE id_estado = ?",
            [idEstado]
        );
        if (states.length === 0) {
            const error = new Error("Estado inválido");
            error.status = 400;
            throw error;
        }

        await connection.query(
            "UPDATE reportes SET id_estado = ? WHERE id_reporte = ?",
            [idEstado, idReporte]
        );
        await connection.query(
            `INSERT INTO notificaciones (id_usuario, id_reporte, tipo, mensaje)
             VALUES (?, ?, 'estado', ?)`,
            [
                reports[0].id_usuario,
                idReporte,
                `Tu reporte ahora está en estado: ${states[0].nombre}`
            ]
        );

        await connection.commit();
        return { nombre: states[0].nombre };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { actualizarEstadoReporte };
