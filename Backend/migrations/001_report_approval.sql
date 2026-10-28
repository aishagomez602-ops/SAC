CREATE TABLE IF NOT EXISTS aprobaciones_reportes (
    id_reporte INT NOT NULL PRIMARY KEY,
    estado_revision ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    id_administrador INT NULL,
    fecha_revision DATETIME NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_aprobaciones_estado (estado_revision)
) ENGINE=InnoDB;

INSERT INTO aprobaciones_reportes (id_reporte, estado_revision, fecha_revision)
SELECT id_reporte, 'aprobado', NOW()
FROM reportes
ON DUPLICATE KEY UPDATE id_reporte = VALUES(id_reporte);
