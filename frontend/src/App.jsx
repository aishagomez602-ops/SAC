import { useState } from "react";
import "./App.css";
/*
function Logo() {
  return (
    <div className="logo">
        <img src="/images/fabicon,fondo.jpeg" alt=""/>
    </div>
  );
}

function Login({ cambiarPantalla }) {
  return (
    <div className="screen login-screen">
      <Logo />

      <div className="form">
        <div className="input-box">
          <span>♙</span>
          <input type="text" placeholder="Usuario o email" />
        </div>

        <div className="input-box">
          <span>🔒</span>
          <input type="password" placeholder="Contraseña" />
        </div>

        <button className="main-button" onClick={() => cambiarPantalla("inicio")}>
          Iniciar sesión
        </button>

        <p className="register-text">
          ¿No tienes una cuenta?{" "}
          <button onClick={() => cambiarPantalla("registro")}>
            Registrate
          </button>
        </p>

        <div className="separator">
          <span></span>
          <b>o</b>
          <span></span>
        </div>

        <button className="google-button">
          <b>G</b> Continuar con Google
        </button>
      </div>

      <div className="city-decoration">
        <p>imagen</p>
      </div>
    </div>
  );
}

function Registro({ cambiarPantalla }) {
  return (
    <div className="screen">
      <button className="back-button" onClick={() => cambiarPantalla("login")}>   
        ‹
      </button>
     <div className="logo-2">
        <img src="/images/fabicon,fondo.jpeg" alt=""/>
    </div>

      <div className="register-container">
        <h2>Crear una cuenta</h2>

         <div className="input-box">
          <span>c</span>
          <input type="email" placeholder="DNI" />
        </div>

        <div className="input-box">
          <span>♙</span>
          <input type="text" placeholder="Nombre" />
        </div>

        <div className="input-box">
          <span>♙</span>
          <input type="text" placeholder="Apellido" />
        </div> 
        

        <div className="input-box">
          <span>✉</span>
          <input type="email" placeholder="Email" />
        </div>

        <div className="input-box">
          <span>🔒</span>
          <input type="password" placeholder="Contraseña" />
        </div>

        <button
          className="main-button"
          onClick={() => cambiarPantalla("inicio")}
        >
          Registrarse
        </button>

        <p className="register-text">
          ¿Ya tienes una cuenta?{" "}
          <button onClick={() => cambiarPantalla("login")}>
            Iniciar sesión
          </button>
        </p> 
      </div>
    </div>
  );
}

function Inicio({ cambiarPantalla }) {
  return (
    <div className="screen home-screen">

      <header className="home-header">
        <button className="menu-button">☰</button>

        <div className="logo-2 ">
          <img src="/images/fabicon,fondo  .jpeg" alt=""/>
        </div>

        <button className="profile-button">♙</button>
      </header>

      <main className="home-content">

        <h2>¡Bienvenido/a, Usuario!</h2>
        <p className="subtitle">
           un barrio mejor
        </p>

        <div className="home-grid">

          <button
            className="home-card report-card"
            onClick={() => cambiarPantalla("reporte")}
          >
            <span>📢</span>
            <strong>Reportar<br />un problema</strong>
          </button>

          <button className="home-card">
            <span>📄</span>
            <strong>Mis<br />reportes</strong>
          </button>

          <button className="home-card">
            <span>🗺️</span>
            <strong>Problemas<br />del barrio</strong>
          </button>

          <button className="home-card">
            <span>📖</span>
            <strong>Guía de<br />uso</strong>
          </button>

        </div>

        <div className="last-reports">

          <div className="reports-title">
            <strong>Últimos reportes en tu barrio</strong>
            <button>Ver todos →</button>
          </div>

          <div className="report-preview">

            <div className="report-image">
              🕳️
            </div>

            <div className="report-info">
              <strong>Bache en la calle</strong>
              <p>Calle 12 y 5</p>
              <span>En proceso</span>
            </div>

            <b>›</b>

          </div>

        </div>

      </main>

      <nav className="bottom-nav">
        <button className="active">⌂<small>Inicio</small></button>
        <button>📣<small>Reportes</small></button>
        <button>🗺️<small>Mapa</small></button>
        <button>🔔<small>Notificaciones</small></button>
        <button>🙍‍♀️<small>Perfil</small></button>
      </nav>

    </div>
  );
}

function Reporte({ cambiarPantalla }) {

  const categorias = [
    "📍 Calles y veredas",
    "💡 Alumbrado",
    "🗑 Basura",
    "💧 Agua",
    "🌳 Espacios verdes",
    "🚦 Tránsito",
    "🚧 Señalización",
    "⭕ Otro"
  ];

  return (
    <div className="screen reporte-screen">

      <header className="report-header">
        <button onClick={() => cambiarPantalla("inicio")}>‹</button>
        <h2>Reportar problema</h2>
      </header>

      <main className="report-form">

        <label>Categoría</label>

        <select>
          <option>Seleccioná una categoría</option>
          {categorias.map((categoria, index) => (
            <option key={index}>{categoria}</option>
          ))}
        </select>

        <label>Descripción</label>

        <textarea
          placeholder="Contanos qué sucede..."
          rows="4"
        />

        <label>
          Foto <span>(opcional)</span>
        </label>

        <div className="photo-upload">
          <span>📷</span>
          <p>Seleccioná una imagen</p>
        </div>

        <button className="main-button">
          Enviar reporte
        </button>

      </main>

    </div>
  );
}

function App() {

  const [pantalla, setPantalla] = useState("login");

  return (
    <div className="app">

      {pantalla === "login" && (
        <Login cambiarPantalla={setPantalla} />
      )}

      {pantalla === "registro" && (
        <Registro cambiarPantalla={setPantalla} />
      )}

      {pantalla === "inicio" && (
        <Inicio cambiarPantalla={setPantalla} />
      )}

      {pantalla === "reporte" && (
        <Reporte cambiarPantalla={setPantalla} />
      )}

    </div>
  );
}

export default App; 

*/

const Icon = ({ type }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  

  if (type === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" wid  th="18" height="14" rx="1.5" />
        <path d="m3 6 9 7 9-7" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg {...common}>
        <rect x="5" y="10" width="14" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
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
  return (
   <p>ciudad</p>

  );
}

function Field({ icon, type = "text", placeholder }) {
  return (
    <div className="field">
      <span className="field-icon"><Icon type={icon} /></span>
      <input type={type} placeholder={placeholder} />
    </div>
  );
}

function Login({ goRegister, goHome }) {
  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />

      <main className="layout login-layout">
        <section className="presentation">
          <Logo />

          <h1>
            Un barrio mejor<br />
            también depende<br />
            <strong>de VOS</strong>
          </h1>

          <p>
            Reportá problemas, y ayudá a un barrio<br />
            más ordenado y cuidado más lindo para todos.
          </p>

          <CityIllustration />
        </section>

        <section className="card login-card">
          <h2>Iniciar sesión</h2>
          <p className="card-description">Ingresá a tu cuenta para continuar</p>

          <form onSubmit={(e) => { e.preventDefault(); goHome(); }}>
            <Field icon="mail" placeholder="Correo electrónico o usuario" />
            <Field icon="lock" type="password" placeholder="Contraseña" />

            <div className="form-options">
              <label className="remember">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <button type="button" className="text-button">¿Olvidaste tu contraseña?</button>
            </div>

            <button className="primary-button" type="submit">Iniciar sesión</button>
          </form>

          <div className="divider"><span>o</span></div>

          <button className="secondary-button" onClick={goRegister}>
            Crear una cuenta
          </button>
        </section>
      </main>

      <span className="page-number">S.A.C. - Pantalla 1</span>
    </div>
  );
}

function Register({ goLogin }) {
  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />

      <main className="layout register-layout">
        <section className="presentation register-presentation">
          <Logo />

          <h1 className="register-title">
            Juntos<br />
            hacemos un<br />
            barrio mejor
          </h1>

          <CityIllustration />
        </section>

        <section className="card register-card">
          <h2>Crear cuenta</h2>
          <p className="card-description">Completá tus datos para unirte a la comunidad</p>

          <form onSubmit={(e) => { e.preventDefault(); goLogin(); }}>
            <Field icon="user" placeholder="DNI" />
            <Field icon="user" placeholder="Nombre" />
            <Field icon="user" placeholder="Apellido" />
            <Field icon="mail" placeholder="Correo electrónico" />
            <Field icon="user" placeholder="Usuario" />
            <Field icon="lock" type="password" placeholder="Contraseña" />

            <button className="primary-button register-button" type="submit">
              Registrarme
            </button>
          </form>

          <button className="login-link" onClick={goLogin}>
            ¿Ya tenés una cuenta? Iniciar sesión
          </button>
        </section>
      </main>

      <span className="page-number">S.A.C. - Pantalla 2</span>
    </div>
  );
}

/* ==========================================================================
   NUEVAS PANTALLAS (S.A.C. 3, 4 y 5)
   ========================================================================== */

function AppLayout({ activeNav, navigateTo, children, screenNumber }) {
  return (
    <div className="sac-app-container">
      {/* Top Navbar */}
      <header className="sac-navbar">
        <div className="sac-logo-area">
          <img src="/images/fabicon,fondo.jpeg" alt="Logo S.A.C." className="sac-nav-logo" />
          <div className="sac-brand-titles">
            <span className="sac-brand-main">S.A.C</span>
            <span className="sac-brand-sub">Sistema de Atención Ciudadana</span>
          </div>
        </div>
        <div className="sac-user-profile">
          <span className="sac-user-avatar">👤</span>
          <span className="sac-user-name">Aisha Gomez</span>
          <span className="sac-user-arrow">⌄</span>
        </div>
      </header>

      <div className="sac-body-layout">
        {/* Sidebar Left Navigation */}
        <aside className="sac-sidebar">
          <nav className="sac-nav-menu">
            <button
              className={`sac-nav-item ${activeNav === "home" ? "active" : ""}`}
              onClick={() => navigateTo("home")}
            >
              <span className="sac-nav-icon">🏠</span>
              <span>Inicio</span>
            </button>
            <button
              className={`sac-nav-item ${activeNav === "reportes" ? "active" : ""}`}
              onClick={() => navigateTo("mis-reportes")}
            >
              <span className="sac-nav-icon">📄</span>
              <span>Reportes</span>
            </button>
            <button className="sac-nav-item">
              <span className="sac-nav-icon">🗺️</span>
              <span>Mapa</span>
            </button>
            <button className="sac-nav-item">
              <span className="sac-nav-icon">🔔</span>
              <span>Notificaciones</span>
            </button>
            <button className="sac-nav-item">
              <span className="sac-nav-icon">👤</span>
              <span>Perfil</span>
            </button>
          </nav>
        </aside>

        {/* Main Workspace Area */}
        <main className="sac-content-area">
          {children}
        </main>
      </div>

      <span className="page-number">S.A.C. - Pantalla {screenNumber}</span>
    </div>
  );
}

/* Pantalla 3: Dashboard Principal */
function Dashboard({ navigateTo }) {
  return (
    <AppLayout activeNav="home" navigateTo={navigateTo} screenNumber="3">
      <div className="sac-dashboard-header">
        <div>
          <h1 className="sac-welcome-title">¡Bienvenido/a, Aisha!</h1>
          <p className="sac-welcome-subtitle">Juntos hacemos un vecindario mejor</p>
        </div>

        <div className="sac-city-info-card">
          <h3>Tu ciudad, más cuidada</h3>
          <p>Participá y ayudá a mejorar tu barrio.</p>
        </div>
      </div>

      {/* Banner Principal Reportar */}
      <div
        className="sac-hero-report-banner"
        onClick={() => navigateTo("reportar-form")}
      >
        <div className="sac-hero-left">
          <div className="sac-megaphone-icon">📢</div>
          <div className="sac-hero-text">
            <h2>Reportar un problema</h2>
            <p>Tu aporte hace la diferencia</p>
          </div>
        </div>
        <div className="sac-hero-arrow">➔</div>
      </div>

      {/* Tarjetas de Accesos Rápidos */}
      <div className="sac-dashboard-grid">
        <div className="sac-dash-card" onClick={() => navigateTo("mis-reportes")}>
          <div className="sac-dash-card-icon orange-bg">📋</div>
          <h3>Mis reportes</h3>
          <p>Revisá el estado de tus reportes</p>
        </div>

        <div className="sac-dash-card">
          <div className="sac-dash-card-icon orange-bg">📍</div>
          <h3>Problemas del barrio</h3>
          <p>Conocé los problemas más comunes</p>
        </div>

        <div className="sac-dash-card">
          <div className="sac-dash-card-icon orange-bg">📖</div>
          <h3>Guía de uso</h3>
          <p>Aprendé a usar el sistema</p>
        </div>
      </div>
    </AppLayout>
  );
}

/* Pantalla 4: Formulario de Reporte */
function ReportForm({ navigateTo }) {
  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="4">
      <h1 className="sac-page-title">Reportar un problema</h1>
      <p className="sac-page-subtitle">Completá la información para enviar tu reporte</p>

      <div className="sac-report-layout">
        {/* Formulario Principal */}
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
              <textarea
                className="sac-textarea"
                placeholder="Contanos qué sucede..."
                maxLength={500}
              ></textarea>
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

          <button
            className="sac-primary-btn"
            onClick={() => navigateTo("mis-reportes")}
          >
            Enviar reporte
          </button>
        </div>

        {/* Menú Lateral de Categorías */}
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
function MyReports({ navigateTo }) {
  const [filter, setFilter] = useState("todos");

  const reports = [
    {
      id: 1,
      title: "Bache en la calle",
      location: "Calle 12 y 5",
      date: "08/09/2026",
      status: "En proceso",
      statusClass: "status-in-process",
    },
    {
      id: 2,
      title: "Basura en la vereda",
      location: "Calle 12 y 5",
      date: "08/09/2026",
      status: "Pendiente",
      statusClass: "status-pending",
    },
    {
      id: 3,
      title: "Falta de alumbrado",
      location: "Calle 12 y 5",
      date: "08/09/2026",
      status: "Resuelto",
      statusClass: "status-resolved",
    },
  ];

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="5">
      <h1 className="sac-page-title">Mis reportes</h1>
      <p className="sac-page-subtitle">Acá podés ver el estado de todos tus reportes</p>

      {/* Tabs de Filtro */}
      <div className="sac-filter-tabs">
        <button
          className={`sac-tab ${filter === "todos" ? "active" : ""}`}
          onClick={() => setFilter("todos")}
        >
          Todos
        </button>
        <button
          className={`sac-tab ${filter === "pendientes" ? "active" : ""}`}
          onClick={() => setFilter("pendientes")}
        >
          Pendientes
        </button>
        <button
          className={`sac-tab ${filter === "en-proceso" ? "active" : ""}`}
          onClick={() => setFilter("en-proceso")}
        >
          En proceso
        </button>
        <button
          className={`sac-tab ${filter === "resueltos" ? "active" : ""}`}
          onClick={() => setFilter("resueltos")}
        >
          Resueltos
        </button>
      </div>

      {/* Lista de Tarjetas */}
      <div className="sac-reports-list">
        {reports.map((item) => (
          <div className="sac-report-card" key={item.id}>
            <div className="sac-report-thumb">FOTO</div>
            <div className="sac-report-info">
              <h3>{item.title}</h3>
              <p>{item.location} • {item.date}</p>
            </div>
            <div className={`sac-status-badge ${item.statusClass}`}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

/* Componente Principal Manejador de Vistas */
export default function App() {
  const [screen, setScreen] = useState("login");

  if (screen === "login") {
    return <Login goRegister={() => setScreen("register")} goHome={() => setScreen("home")} />;
  }
  if (screen === "register") {
    return <Register goLogin={() => setScreen("login")} />;
  }
  if (screen === "home") {
    return <Dashboard navigateTo={setScreen} />;
  }
  if (screen === "reportar-form") {
    return <ReportForm navigateTo={setScreen} />;
  }
  if (screen === "mis-reportes") {
    return <MyReports navigateTo={setScreen} />;
  }

  return <Login goRegister={() => setScreen("register")} goHome={() => setScreen("home")} />;
}

/* Pantalla: Mapa (S.A.C. - Pantalla 6) */
function MapScreen({ navigateTo }) {
  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} screenNumber="6">
      <h1 className="sac-page-title">Mapa</h1>
      <p className="sac-page-subtitle">Explorá los reportes de tu zona</p>

      {/* Leyenda de Estados */}
      <div className="sac-map-legend">
        <div className="sac-legend-item">
          <span className="legend-dot red"></span>
          <span>Pendiente</span>
        </div>
        <div className="sac-legend-item">
          <span className="legend-dot yellow"></span>
          <span>En proceso</span>
        </div>
        <div className="sac-legend-item">
          <span className="legend-dot green"></span>
          <span>Resuelto</span>
        </div>
      </div>

      {/* Vista del Mapa con Pines */}
      <div className="sac-map-canvas">
        <div className="sac-map-grid-overlay" />
        <div className="sac-map-river" />

        {/* Marcadores / Pines */}
        <div className="sac-map-pin red" style={{ top: '25%', left: '44%' }}>📍</div>
        <div className="sac-map-pin red" style={{ top: '50%', left: '54%' }}>📍</div>
        <div className="sac-map-pin red" style={{ top: '68%', left: '43%' }}>📍</div>

        <div className="sac-map-pin yellow" style={{ top: '51%', left: '38%' }}>📍</div>
        <div className="sac-map-pin yellow" style={{ top: '63%', left: '63%' }}>📍</div>
        <div className="sac-map-pin yellow" style={{ top: '68%', left: '26%' }}>📍</div>

        <div className="sac-map-pin green" style={{ top: '46%', left: '23%' }}>📍</div>
        <div className="sac-map-pin green" style={{ top: '41%', left: '68%' }}>📍</div>
      </div>

      {/* Tarjeta Flotante Inferior de Vista Previa */}
      <div 
        className="sac-map-preview-card"
        onClick={() => navigateTo("detalle-reporte")}
      >
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

/* Pantalla: Detalle del reporte (S.A.C. - Pantalla 7) */
function ReportDetail({ navigateTo }) {
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
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="7">
      <h1 className="sac-page-title">Detalle del reporte</h1>
      <p className="sac-page-subtitle">Información y seguimiento</p>

      <div className="sac-detail-card">
        {/* Banner de Imagen Principal */}
        <div className="sac-detail-photo-placeholder">
          <span>FOTO DEL REPORTE</span>
        </div>

        {/* Encabezado e Info Principal */}
        <h2 className="sac-detail-title">Bache en Av. 2</h2>
        
        <div className="sac-detail-meta-bar">
          <div className="sac-meta-item">
            <span className="sac-meta-icon">📍</span>
            <span>Calle 12 y 5</span>
          </div>
          <div className="sac-meta-item">
            <span className="sac-meta-icon">📅</span>
            <span>08/09/2026</span>
          </div>
          <div className="sac-meta-item">
            <span className="sac-meta-icon">🧡</span>
            <span>{likes} vecinos lo apoyaron</span>
          </div>
        </div>

        <div className="sac-detail-status-wrapper">
          <span className="sac-status-badge status-in-process">En proceso</span>
        </div>

        {/* Sección Descripción */}
        <div className="sac-detail-description-box">
          <h3>Descripción</h3>
          <p>
            El bache se encuentra en la esquina y dificulta el tránsito de los
            vehículos. Ya ha causado varios inconvenientes.
          </p>
        </div>

        {/* Botón Acción Principal */}
        <button 
          className={`sac-support-button ${hasLiked ? "supported" : ""}`}
          onClick={handleSupport}
        >
          <span className="sac-like-icon">👍</span>
          <span>{hasLiked ? "Reporte apoyado" : "Apoyar reporte"}</span>
        </button>
      </div>
    </AppLayout>
  );
}

/* Pantalla: Notificaciones (S.A.C. - Pantalla 8) */
function NotificationsScreen({ navigateTo }) {
  const notifications = [
    {
      id: 1,
      icon: "📋",
      iconBg: "#f97316",
      title: "Tu reporte fue revisado",
      desc: "El administrador revisó tu reporte #152.",
      time: "Hace 2 horas"
    },
    {
      id: 2,
      icon: "📍",
      iconBg: "#f97316",
      title: "El municipio comenzó a trabajar",
      desc: "El área de Obras Públicas asignó tu reporte #152.",
      time: "Hace 5 horas"
    },
    {
      id: 3,
      icon: "✔",
      iconBg: "#f97316",
      title: "Tu reporte fue resuelto",
      desc: "El reporte Bache en Av. 2 fue marcado como resuelto.",
      time: "Hace 2 días"
    },
    {
      id: 4,
      icon: "👍",
      iconBg: "#ea580c",
      title: "Tu reporte fue apoyado",
      desc: "3 vecinos más apoyaron tu reporte #138.",
      time: "Hace 3 días"
    }
  ];

  return (
    <AppLayout activeNav="notificaciones" navigateTo={navigateTo} screenNumber="8">
      <h1 className="sac-page-title">Notificaciones</h1>
      <p className="sac-page-subtitle">Enterate de todas las novedades</p>

      <div className="sac-notifications-list">
        {notifications.map((item) => (
          <div className="sac-notification-card" key={item.id}>
            <div 
              className="sac-notification-icon-wrapper"
              style={{ backgroundColor: item.iconBg }}
            >
              <span>{item.icon}</span>
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