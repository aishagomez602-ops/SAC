import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "/api";

function getStoredUser() {
  try {
    const user = localStorage.getItem("sac_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("sac_token");
  const { headers: customHeaders, ...fetchOptions } = options;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.mensaje || "Error de conexión";
    throw new Error(message);
  }

  return data;
}

const Icon = ({ type, size = 22 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    megaphone: <><path d="m3 11 14-5v12L3 13z" /><path d="M17 10h3a2 2 0 0 1 0 4h-3M6 14l2 6h4l-2-7" /></>,
    clipboard: <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M9 11h6M9 15h6" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h7" /></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></>,
    road: <><path d="M8 3 5 21M16 3l3 18M12 5v3m0 4v3m0 4v2" /></>,
    light: <><path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-.8.6-1 1.2-1 2H9c0-.8-.2-1.4-1-2Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
    water: <><path d="M12 3s7 8 7 12a7 7 0 0 1-14 0c0-4 7-12 7-12Z" /><path d="M9 16a3 3 0 0 0 3 2" /></>,
    leaf: <><path d="M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-6 10-16Z" /><path d="M5 20c3-5 7-8 12-11" /></>,
    car: <><path d="m5 11 2-5h10l2 5M3 11h18v7H3zM6 18v2m12-2v2" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></>,
    warning: <><path d="m12 3 10 18H2z" /><path d="M12 9v5m0 3v.01" /></>,
    wrench: <><path d="M14 6a5 5 0 0 0-6 6L3 17a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11a4.8 4.8 0 0 1 8.8-2.5 4.8 4.8 0 0 1 8.8 2.5Z" />,
    like: <><path d="M7 10v11H4V10zM7 20h9a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 17.5 9H13l.7-3.2A2.3 2.3 0 0 0 11.5 3L7 10" /></>
  };

  return (
    <svg {...common} aria-hidden="true">
      {icons[type] || icons.user}
    </svg>
  );
};

function Logo() {
  return (
    <div className="logo">
      <div className="Logo">
        <img src="/images/fabicon,fondo.jpeg" alt=""/>
      </div>
    </div>
  );
}

function CityIllustration() {
  return <p>ciudad</p>;
}

function Field({ icon, type = "text", placeholder, name, value, onChange, autoComplete }) {
  return (
    <div className="field">
      <span className="field-icon"><Icon type={icon} /></span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function Login({ goRegister, goHome, loginForm, setLoginForm, submitting, errorMessage }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />

      <main className="layout login-layout">
        <section className="presentation">
          <Logo />
          <h1>Un barrio mejor<br />también depende<br /><strong>de VOS</strong></h1>
          <p>Reportá problemas, y ayudá a un barrio<br />más ordenado y cuidado más lindo para todos.</p>
          <CityIllustration />
        </section>

        <section className="card login-card">
          <h2>Iniciar sesión</h2>
          <p className="card-description">Ingresá a tu cuenta para continuar</p>

          <form onSubmit={(e) => { e.preventDefault(); goHome(); }}>
            <Field icon="mail" name="email" placeholder="Correo electrónico" value={loginForm.email} onChange={handleChange} autoComplete="email" />
            <Field icon="lock" type="password" name="password" placeholder="Contraseña" value={loginForm.password} onChange={handleChange} autoComplete="current-password" />

            <div className="form-options">
              <label className="remember">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <button type="button" className="text-button">¿Olvidaste tu contraseña?</button>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="divider"><span>o</span></div>

          <button className="secondary-button" onClick={goRegister} type="button">
            Crear una cuenta
          </button>
        </section>
      </main>

      <span className="page-number">S.A.C. - Pantalla 1</span>
    </div>
  );
}

function Register({ goLogin, registerForm, setRegisterForm, submitting, errorMessage, successMessage, onSubmit }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />

      <main className="layout register-layout">
        <section className="presentation register-presentation">
          <Logo />
          <h1 className="register-title">Juntos<br />hacemos un<br />barrio mejor</h1>
          <CityIllustration />
        </section>

        <section className="card register-card">
          <h2>Crear cuenta</h2>
          <p className="card-description">Completá tus datos para unirte a la comunidad</p>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <Field icon="lock" name="DNI" type="text" placeholder="DNI" value={registerForm.DNI} onChange={handleChange} autoComplete="off" />
            <Field icon="user" name="nombre" placeholder="Nombre" value={registerForm.nombre} onChange={handleChange} autoComplete="given-name" />
            <Field icon="user" name="apellido" placeholder="Apellido" value={registerForm.apellido} onChange={handleChange} autoComplete="family-name" />
            <Field icon="mail" name="email" placeholder="Correo electrónico" type="email" value={registerForm.email} onChange={handleChange} autoComplete="email" />
            <Field icon="lock" name="contrasena" type="password" placeholder="Contraseña" value={registerForm.contrasena} onChange={handleChange} autoComplete="new-password" />

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <button className="primary-button register-button" type="submit" disabled={submitting}>
              {submitting ? "Registrando..." : "Registrarme"}
            </button>
          </form>

          <button className="login-link" onClick={goLogin} type="button">
            ¿Ya tenés una cuenta? Iniciar sesión
          </button>
        </section>
      </main>

      <span className="page-number">S.A.C. - Pantalla 2</span>
    </div>
  );
}

function AppLayout({ activeNav, navigateTo, children, screenNumber, user, onLogout }) {
  const nombreUsuario = user?.nombre
    ? `${user.nombre} ${user.apellido || ""}`.trim()
    : "Aisha Gomez";

  return (
    <div className="sac-app-container">
      <header className="sac-navbar">
        <div className="sac-logo-area">
          <img src="/images/fabicon,fondo.jpeg" alt="Logo S.A.C." className="sac-nav-logo" />
          <div className="sac-brand-titles">
            <span className="sac-brand-main">S.A.C</span>
            <span className="sac-brand-sub">Sistema de Atención Ciudadana</span>
          </div>
        </div>
        <div className="sac-user-profile">
          <span className="sac-user-avatar"><Icon type="user" size={17} /></span>
          <span className="sac-user-name">{nombreUsuario}</span>
          <span className="sac-user-arrow">⌄</span>
          {onLogout && (
            <button className="sac-logout-btn" onClick={onLogout} type="button">
              Salir
            </button>
          )}
        </div>
      </header>

      <div className="sac-body-layout">
        <aside className="sac-sidebar">
          <nav className="sac-nav-menu">
            <button
              type="button"
              className={`sac-nav-item ${activeNav === "home" ? "active" : ""}`}
              onClick={() => navigateTo("home")}
            >
              <span className="sac-nav-icon"><Icon type="home" size={19} /></span>
              <span>Inicio</span>
            </button>
            <button
              type="button"
              className={`sac-nav-item ${activeNav === "reportes" ? "active" : ""}`}
              onClick={() => navigateTo("mis-reportes")}
            >
              <span className="sac-nav-icon"><Icon type="file" size={19} /></span>
              <span>Reportes</span>
            </button>
            <button 
              type="button" 
              className={`sac-nav-item ${activeNav === "mapa" ? "active" : ""}`}
              onClick={() => navigateTo("mapa")}
            >
              <span className="sac-nav-icon"><Icon type="map" size={19} /></span>
              <span>Mapa</span>
            </button>
            <button 
              type="button" 
              className={`sac-nav-item ${activeNav === "notificaciones" ? "active" : ""}`}
              onClick={() => navigateTo("notificaciones")}
            >
              <span className="sac-nav-icon"><Icon type="bell" size={19} /></span>
              <span>Notificaciones</span>
            </button>
            <button 
              type="button" 
              className={`sac-nav-item ${activeNav === "perfil" ? "active" : ""}`}
              onClick={() => navigateTo("perfil")}
            >
              <span className="sac-nav-icon"><Icon type="user" size={19} /></span>
              <span>Perfil</span>
            </button>
          </nav>
        </aside>

        <main className="sac-content-area">
          {children}
        </main>
      </div>

      <span className="page-number">S.A.C. - Pantalla {screenNumber}</span>
    </div>
  );
}

/* Pantalla 3: Dashboard Principal */
function Dashboard({ navigateTo, user, onLogout }) {
  const nombre = user?.nombre || "Aisha";

  return (
    <AppLayout activeNav="home" navigateTo={navigateTo} screenNumber="3" user={user} onLogout={onLogout}>
      <div className="sac-dashboard-header">
        <div>
          <h1 className="sac-welcome-title">¡Bienvenido/a, {nombre}!</h1>
          <p className="sac-welcome-subtitle">Juntos hacemos un vecindario mejor</p>
        </div>

        <div className="sac-city-info-card">
          <h3>Tu ciudad, más cuidada</h3>
          <p>Participá y ayudá a mejorar tu barrio.</p>
        </div>
      </div>

      <div
        className="sac-hero-report-banner"
        onClick={() => navigateTo("reportar-form")}
      >
        <div className="sac-hero-left">
          <div className="sac-megaphone-icon"><Icon type="megaphone" size={27} /></div>
          <div className="sac-hero-text">
            <h2>Reportar un problema</h2>
            <p>Tu aporte hace la diferencia</p>
          </div>
        </div>
        <div className="sac-hero-arrow">➔</div>
      </div>

      <div className="sac-dashboard-grid">
        <div className="sac-dash-card" onClick={() => navigateTo("mis-reportes")}>
          <div className="sac-dash-card-icon orange-bg"><Icon type="clipboard" size={21} /></div>
          <h3>Mis reportes</h3>
          <p>Revisá el estado de tus reportes</p>
        </div>

        <div className="sac-dash-card" onClick={() => navigateTo("mapa")}>
          <div className="sac-dash-card-icon orange-bg"><Icon type="pin" size={21} /></div>
          <h3>Problemas del barrio</h3>
          <p>Conocé los problemas más comunes</p>
        </div>

        <div className="sac-dash-card" onClick={() => navigateTo("guia-uso")}>
          <div className="sac-dash-card-icon orange-bg"><Icon type="book" size={21} /></div>
          <h3>Guía de uso</h3>
          <p>Aprendé a usar el sistema</p>
        </div>
      </div>
    </AppLayout>
  );
}

/* Pantalla 4: Formulario de Reporte */
function ReportForm({ navigateTo, user, onLogout }) {
  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="4" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Reportar un problema</h1>
      <p className="sac-page-subtitle">Completá la información para enviar tu reporte</p>

      <div className="sac-report-layout">
        <div className="sac-form-container">
          <div className="sac-form-group">
            <label className="sac-label">Categoría</label>
            <div className="sac-select-wrapper">
              <select className="sac-select" defaultValue="">
                <option value="" disabled>Elegí el tipo de problema</option>
                <option value="calles">Calles y veredas</option>
                <option value="alumbrado">Alumbrado</option>
                <option value="basura">Basura</option>
                <option value="agua">Agua</option>
                <option value="espacios">Espacios verdes</option>
                <option value="transito">Tránsito</option>
                <option value="senalizacion">Señalización</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="sac-form-group">
            <label className="sac-label">Descripción</label>
            <div className="sac-textarea-wrapper">
              <textarea className="sac-textarea" placeholder="Contanos qué sucede..." maxLength={500}></textarea>
              <span className="sac-char-count">0/500</span>
            </div>
          </div>

          <div className="sac-form-group">
            <label className="sac-label">Agregar una foto (opcional)</label>
            <div className="sac-upload-box">
              <div className="sac-camera-icon">📷</div>
              <p>Seleccioná una imagen<br />o arrastrala aquí</p>
            </div>
          </div>

          <button className="sac-primary-btn" onClick={() => navigateTo("mis-reportes")} type="button">
            Enviar reporte
          </button>
        </div>

        <div className="sac-categories-sidebar">
          <h3>Categorías</h3>
          <ul className="sac-categories-list">
            <li><span className="cat-icon">🚧</span> Calles y veredas</li>
            <li><span className="cat-icon">💡</span> Alumbrado</li>
            <li><span className="cat-icon">🗑️</span> Basura</li>
            <li><span className="cat-icon">🚰</span> Agua</li>
            <li><span className="cat-icon">🌱</span> Espacios verdes</li>
            <li><span className="cat-icon">🚗</span> Tránsito</li>
            <li><span className="cat-icon">⚠️</span> Señalización</li>
            <li><span className="cat-icon">🔧</span> Otro</li>
          </ul>
          <div className="sac-plant-decoration">🪴</div>
        </div>
      </div>
    </AppLayout>
  );
}

/* Pantalla 5: Lista de Mis Reportes */
function MyReports({ navigateTo, user, onLogout }) {
  const [filter, setFilter] = useState("todos");

  const reports = [
    { id: 1, title: "Bache en la calle", location: "Calle 12 y 5", date: "08/09/2026", status: "En proceso", statusClass: "status-in-process" },
    { id: 2, title: "Basura en la vereda", location: "Calle 12 y 5", date: "08/09/2026", status: "Pendiente", statusClass: "status-pending" },
    { id: 3, title: "Falta de alumbrado", location: "Calle 12 y 5", date: "08/09/2026", status: "Resuelto", statusClass: "status-resolved" },
  ];

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="5" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Mis reportes</h1>
      <p className="sac-page-subtitle">Acá podés ver el estado de todos tus reportes</p>

      <div className="sac-filter-tabs">
        <button type="button" className={`sac-tab ${filter === "todos" ? "active" : ""}`} onClick={() => setFilter("todos")}>Todos</button>
        <button type="button" className={`sac-tab ${filter === "pendientes" ? "active" : ""}`} onClick={() => setFilter("pendientes")}>Pendientes</button>
        <button type="button" className={`sac-tab ${filter === "en-proceso" ? "active" : ""}`} onClick={() => setFilter("en-proceso")}>En proceso</button>
        <button type="button" className={`sac-tab ${filter === "resueltos" ? "active" : ""}`} onClick={() => setFilter("resueltos")}>Resueltos</button>
      </div>

      <div className="sac-reports-list">
        {reports.map((item) => (
          <div className="sac-report-card clickable" key={item.id} onClick={() => navigateTo("detalle-reporte")}>
            <div className="sac-report-thumb">FOTO</div>
            <div className="sac-report-info">
              <h3>{item.title}</h3>
              <p>{item.location} • {item.date}</p>
            </div>
            <div className={`sac-status-badge ${item.statusClass}`}>{item.status}</div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

/* Pantalla 6: Mapa */
function MapScreen({ navigateTo, user, onLogout }) {
  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} screenNumber="6" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Mapa</h1>
      <p className="sac-page-subtitle">Explorá los reportes de tu zona</p>

      <div className="sac-map-legend">
        <div className="sac-legend-item"><span className="legend-dot red"></span><span>Pendiente</span></div>
        <div className="sac-legend-item"><span className="legend-dot yellow"></span><span>En proceso</span></div>
        <div className="sac-legend-item"><span className="legend-dot green"></span><span>Resuelto</span></div>
      </div>

      <div className="sac-map-canvas">
        <div className="sac-map-grid-overlay" />
        <div className="sac-map-river" />
        <div className="sac-map-pin red" style={{ top: '25%', left: '44%' }}>📍</div>
        <div className="sac-map-pin red" style={{ top: '50%', left: '54%' }}>📍</div>
        <div className="sac-map-pin red" style={{ top: '68%', left: '43%' }}>📍</div>
        <div className="sac-map-pin yellow" style={{ top: '51%', left: '38%' }}>📍</div>
        <div className="sac-map-pin yellow" style={{ top: '63%', left: '63%' }}>📍</div>
        <div className="sac-map-pin yellow" style={{ top: '68%', left: '26%' }}>📍</div>
        <div className="sac-map-pin green" style={{ top: '46%', left: '23%' }}>📍</div>
        <div className="sac-map-pin green" style={{ top: '41%', left: '68%' }}>📍</div>
      </div>

      <div className="sac-map-preview-card" onClick={() => navigateTo("detalle-reporte")}>
        <div className="sac-report-thumb">FOTO</div>
        <div className="sac-report-info">
          <h3>Bache en la calle</h3>
          <p>Calle 12 y 5 • 08/09/2026</p>
          <span className="sac-status-badge status-in-process small-badge">En proceso</span>
        </div>
        <div className="sac-map-preview-arrow">▶</div>
      </div>
    </AppLayout>
  );
}

/* Pantalla 7: Detalle del reporte */
function ReportDetail({ navigateTo, user, onLogout }) {
  const [likes, setLikes] = useState(12);
  const [hasLiked, setHasLiked] = useState(false);

  const handleSupport = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="7" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Detalle del reporte</h1>
      <p className="sac-page-subtitle">Información y seguimiento</p>

      <div className="sac-detail-card">
        <div className="sac-detail-photo-placeholder"><span>FOTO DEL REPORTE</span></div>
        <h2 className="sac-detail-title">Bache en Av. 2</h2>
        
        <div className="sac-detail-meta-bar">
          <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="pin" size={15} /></span><span>Calle 12 y 5</span></div>
          <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="calendar" size={15} /></span><span>08/09/2026</span></div>
          <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="heart" size={15} /></span><span>{likes} vecinos lo apoyaron</span></div>
        </div>

        <div className="sac-detail-status-wrapper"><span className="sac-status-badge status-in-process">En proceso</span></div>

        <div className="sac-detail-description-box">
          <h3>Descripción</h3>
          <p>El bache se encuentra en la esquina y dificulta el tránsito de los vehículos. Ya ha causado varios inconvenientes.</p>
        </div>

        <button className={`sac-support-button ${hasLiked ? "supported" : ""}`} onClick={handleSupport} type="button">
          <span className="sac-like-icon"><Icon type="like" size={18} /></span>
          <span>{hasLiked ? "Reporte apoyado" : "Apoyar reporte"}</span>
        </button>
      </div>
    </AppLayout>
  );
}

/* Pantalla 8: Notificaciones */
function NotificationsScreen({ navigateTo, user, onLogout }) {
  const notifications = [
    { id: 1, icon: "clipboard", iconBg: "#f97316", title: "Tu reporte fue revisado", desc: "El administrador revisó tu reporte #152.", time: "Hace 2 horas" },
    { id: 2, icon: "pin", iconBg: "#f97316", title: "El municipio comenzó a trabajar", desc: "El área de Obras Públicas asignó tu reporte #152.", time: "Hace 5 horas" },
    { id: 3, icon: "file", iconBg: "#f97316", title: "Tu reporte fue resuelto", desc: "El reporte Bache en Av. 2 fue marcado como resuelto.", time: "Hace 2 días" },
    { id: 4, icon: "like", iconBg: "#ea580c", title: "Tu reporte fue apoyado", desc: "3 vecinos más apoyaron tu reporte #138.", time: "Hace 3 días" }
  ];

  return (
    <AppLayout activeNav="notificaciones" navigateTo={navigateTo} screenNumber="8" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Notificaciones</h1>
      <p className="sac-page-subtitle">Enterate de todas las novedades</p>

      <div className="sac-notifications-list">
        {notifications.map((item) => (
          <div className="sac-notification-card" key={item.id}>
            <div className="sac-notification-icon-wrapper" style={{ backgroundColor: item.iconBg }}>
              <Icon type={item.icon} size={20} />
            </div>
            <div className="sac-notification-content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="sac-notification-time">{item.time}</div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

/* Pantalla 9: Guía de uso */
function GuiaUsoScreen({ navigateTo, user, onLogout }) {
  const pasos = [
    { num: 1, icon: "pin", title: "1. Identificá el problema", desc: "Observá cualquier desperfecto o eventualidad en la vía pública (baches, alumbrado, basura, etc.)." },
    { num: 2, icon: "camera", title: "2. Creá tu reporte", desc: "Ingresá a 'Reportar un problema', elegí la categoría adecuada, agregá una descripción detallada, la dirección exacta y adjuntá una foto." },
    { num: 3, icon: "map", title: "3. Marcá la ubicación", desc: "Usá el botón de localización para guardar automáticamente las coordenadas del problema en el mapa del municipio." },
    { num: 4, icon: "clipboard", title: "4. Hacé el seguimiento", desc: "Consultá el avance en 'Mis reportes' o enterate de cambios de estado (Pendiente, En proceso, Resuelto) desde 'Notificaciones'." },
    { num: 5, icon: "heart", title: "5. Apoyá reportes de vecinos", desc: "Explorá el 'Mapa' de tu barrio y apoyá las incidencias de otros vecinos para darles más visibilidad ante el municipio." }
  ];

  return (
    <AppLayout activeNav="guia" navigateTo={navigateTo} screenNumber="9" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Guía de uso</h1>
      <p className="sac-page-subtitle">Aprende a sacar el máximo provecho del Sistema de Atención Ciudadana</p>

      <div className="sac-guide-hero">
        <div className="sac-guide-hero-icon"><Icon type="book" size={32} /></div>
        <div>
          <h2>¿Cómo funciona el S.A.C.?</h2>
          <p>Esta plataforma está diseñada para que puedas reportar incidencias en tu barrio de forma rápida y sencilla.</p>
        </div>
      </div>

      <div className="sac-guide-steps-list">
        {pasos.map((step) => (
          <div className="sac-guide-step-card" key={step.num}>
            <div className="sac-guide-step-number">{step.num}</div>
            <div className="sac-guide-step-icon"><Icon type={step.icon} size={22} /></div>
            <div className="sac-guide-step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sac-guide-footer-card">
        <div>
          <h3>¿Tenés un problema para reportar ahora?</h3>
          <p>Sumá tu aporte y ayudá a construir un vecindario mejor.</p>
        </div>
        <button className="sac-primary-btn sac-guide-cta-btn" onClick={() => navigateTo("reportar-form")} type="button">
          Crear reporte ahora
        </button>
      </div>
    </AppLayout>
  );
}

/* Pantalla 11: Perfil */
function ProfileScreen({ navigateTo, user, setUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || "Aisha");
  const [apellido, setApellido] = useState(user?.apellido || "Gomez");
  const [email, setEmail] = useState(user?.email || "aisha@gmail.com");
  const [foto, setFoto] = useState(user?.foto || null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { ...user, nombre, apellido, email, foto };
    setUser(updated);
    setIsEditing(false);
    setSuccessMsg("¡Perfil actualizado con éxito!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} screenNumber="11" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Perfil</h1>
      <p className="sac-page-subtitle">Administrá tu información y preferencias</p>

      {successMsg && <p className="success-message">{successMsg}</p>}

      {!isEditing ? (
        <>
          <div className="sac-profile-card-header">
            <div className="sac-profile-avatar-large">
              {foto ? <img src={foto} alt="Avatar" className="sac-avatar-img" /> : <span>👤</span>}
            </div>
            <div>
              <h2>{nombre} {apellido}</h2>
              <p>{email}</p>
            </div>
          </div>

          <div className="sac-profile-menu-list">
            <button className="sac-profile-menu-item" onClick={() => setIsEditing(true)} type="button">
              <span className="p-icon">✏️</span>
              <span>Editar perfil</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("cambiar-contrasena")} type="button">
              <span className="p-icon">🔒</span>
              <span>Cambiar contraseña</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("mis-reportes")} type="button">
              <span className="p-icon">📄</span>
              <span>Mis reportes</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("notificaciones")} type="button">
              <span className="p-icon">🔔</span>
              <span>Notificaciones</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" type="button">
              <span className="p-icon">📞</span>
              <span>Contacto</span>
              <span className="p-arrow">›</span>
            </button>
          </div>
        </>
      ) : (
        <form className="sac-form-container" onSubmit={handleSaveProfile}>
          <div className="sac-form-group">
            <label className="sac-label">Foto de perfil</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sac-input" />
          </div>
          <div className="sac-form-group">
            <label className="sac-label">Nombre</label>
            <input type="text" className="sac-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="sac-form-group">
            <label className="sac-label">Apellido</label>
            <input type="text" className="sac-input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          </div>
          <div className="sac-form-group">
            <label className="sac-label">Correo electrónico</label>
            <input type="email" className="sac-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="sac-primary-btn" type="submit">Guardar cambios</button>
            <button className="sac-secondary-btn" type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        </form>
      )}
    </AppLayout>
  );
}

/* Pantalla 12: Cambiar contraseña */
function ChangePasswordScreen({ navigateTo, user, onLogout }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (nueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (nueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setMsg("¡Contraseña actualizada correctamente!");
    setTimeout(() => {
      navigateTo("perfil");
    }, 1200);
  };

  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} screenNumber="12" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Cambiar contraseña</h1>
      <p className="sac-page-subtitle">Por tu seguridad, te recomendamos usar una contraseña fuerte.</p>

      <div className="sac-detail-card">
        <form onSubmit={handleSubmit}>
          <div className="sac-form-group">
            <label className="sac-label">Contraseña actual</label>
            <input
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
            />
          </div>

          <div className="sac-form-group">
            <label className="sac-label">Nueva contraseña</label>
            <input
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
            />
          </div>

          <div className="sac-form-group">
            <label className="sac-label">Confirmar nueva contraseña</label>
            <input
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {msg && <p className="success-message">{msg}</p>}

          <button className="sac-primary-btn" type="submit" style={{ marginTop: "15px" }}>
            Guardar cambios
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

/* Componente Principal App */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState({ nombre: "Aisha", apellido: "Gomez", email: "aisha@gmail.com", foto: null });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    DNI: "",
    nombre: "",
    apellido: "",
    email: "",
    contrasena: ""
  });

  const handleLoginSubmit = () => {
    setSubmitting(true);
    setErrorMessage("");
    setTimeout(() => {
      setUser((prev) => ({ ...prev, email: loginForm.email || prev.email }));
      setSubmitting(false);
      setScreen("home");
    }, 500);
  };

  const handleRegisterSubmit = () => {
    setSubmitting(true);
    setErrorMessage("");
    setTimeout(() => {
      setSuccessMessage("¡Cuenta creada con éxito!");
      setSubmitting(false);
      setTimeout(() => {
        setScreen("login");
        setSuccessMessage("");
      }, 1000);
    }, 500);
  };

  const handleLogout = () => {
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <Login
        goRegister={() => { setScreen("register"); setErrorMessage(""); }}
        goHome={handleLoginSubmit}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        submitting={submitting}
        errorMessage={errorMessage}
      />
    );
  }

  if (screen === "register") {
    return (
      <Register
        goLogin={() => { setScreen("login"); setErrorMessage(""); }}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        submitting={submitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onSubmit={handleRegisterSubmit}
      />
    );
  }

  if (screen === "home") return <Dashboard navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "reportar-form") return <ReportForm navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "mis-reportes") return <MyReports navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "mapa") return <MapScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "detalle-reporte") return <ReportDetail navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "notificaciones") return <NotificationsScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "guia-uso") return <GuiaUsoScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "perfil") return <ProfileScreen navigateTo={setScreen} user={user} setUser={setUser} onLogout={handleLogout} />;
  if (screen === "cambiar-contrasena") return <ChangePasswordScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;

  return (
    <Login
      goRegister={() => setScreen("register")}
      goHome={handleLoginSubmit}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
}