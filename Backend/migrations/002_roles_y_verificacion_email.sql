ALTER TABLE usuarios
MODIFY rol ENUM('vecino', 'administrador', 'area_municipal') NOT NULL DEFAULT 'vecino';

CREATE TABLE IF NOT EXISTS desafios_acceso (
    id_desafio CHAR(64) NOT NULL PRIMARY KEY,
    id_usuario INT NOT NULL,
    codigo_hash CHAR(64) NOT NULL,
    intentos TINYINT UNSIGNED NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vence_en DATETIME NOT NULL,
    INDEX idx_desafios_usuario_fecha (id_usuario, creado_en),
    INDEX idx_desafios_vencimiento (vence_en)
) ENGINE=InnoDB;
