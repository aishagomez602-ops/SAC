CREATE TABLE IF NOT EXISTS desafios_recuperacion (
    id_desafio CHAR(64) NOT NULL PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo_hash CHAR(64) NOT NULL,
    intentos TINYINT UNSIGNED NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vence_en DATETIME NOT NULL,
    INDEX idx_recuperacion_usuario_fecha (id_usuario, creado_en),
    INDEX idx_recuperacion_vencimiento (vence_en)
) ENGINE=InnoDB;
