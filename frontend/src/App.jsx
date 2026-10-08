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

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.mensaje || "Error de conexión";
    throw new Error(message);
  }

  return data;
}
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
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goHome();
            }}
          >
            <Field
              icon="mail"
              name="email"
              placeholder="Correo electrónico"
              value={loginForm.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <Field
              icon="lock"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

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

          <button className="secondary-button" onClick={goRegister}>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Field icon="lock" name="DNI " type="DNI" placeholder="DNI" value={registerForm.DNI} onChange={handleChange} autoComplete="DNI" />
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

function AppLayout({ activeNav, navigateTo, children, screenNumber, user, onLogout }) {
  const nombreUsuario = user?.nombre
    ? `${user.nombre} ${user.apellido || ""}`.trim()
    : "Usuario";

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
        {/* Sidebar Left Navigation */}
        <aside className="sac-sidebar">
          <nav className="sac-nav-menu">
            <button
              type="button"
              className={`sac-nav-item ${activeNav === "home" ? "active" : ""}`}
              onClick={() => navigateTo("home")}
            >
              <span className="sac-nav-icon">🏠</span>
              <span>Inicio</span>
            </button>
            <button
              type="button"
              className={`sac-nav-item ${activeNav === "reportes" ? "active" : ""}`}
              onClick={() => navigateTo("mis-reportes")}
            >
              <span className="sac-nav-icon">📄</span>
              <span>Reportes</span>
            </button>
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("mapa")}>
              <span className="sac-nav-icon">🗺️</span>
              <span>Mapa</span>
            </button>
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("notificaciones")}>
              <span className="sac-nav-icon">🔔</span>
              <span>Notificaciones</span>
            </button>
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("perfil")}>
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
function Dashboard({ navigateTo, user, onLogout }) {
  const nombre = user?.nombre || "Usuario";

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
function ReportForm({ navigateTo, onLogout }) {
  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="4" onLogout={onLogout}>
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
function MyReports({ navigateTo, onLogout }) {
  const [filter, setFilter] = useState("todos");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarReportes() {
      try {
        const data = await apiFetch("/reportes/mis-reportes");
        setReports(data.reportes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    cargarReportes();
  }, []);

  const filteredReports = reports.filter((reporte) => {
    if (filter === "todos") return true;
    const estado = (reporte.estado || "").toLowerCase();
    if (filter === "pendientes") return estado === "pendiente";
    if (filter === "en-proceso") return estado === "en proceso";
    if (filter === "resueltos") return estado === "resuelto";
    return true;
  });

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="5" onLogout={onLogout}>
      <h1 className="sac-page-title">Mis reportes</h1>
      <p className="sac-page-subtitle">Acá podés ver el estado de todos tus reportes</p>

      <div className="sac-filter-tabs">
        <button className={`sac-tab ${filter === "todos" ? "active" : ""}`} onClick={() => setFilter("todos")}>Todos</button>
        <button className={`sac-tab ${filter === "pendientes" ? "active" : ""}`} onClick={() => setFilter("pendientes")}>Pendientes</button>
        <button className={`sac-tab ${filter === "en-proceso" ? "active" : ""}`} onClick={() => setFilter("en-proceso")}>En proceso</button>
        <button className={`sac-tab ${filter === "resueltos" ? "active" : ""}`} onClick={() => setFilter("resueltos")}>Resueltos</button>
      </div>

      <div className="sac-reports-list">
        {loading ? (
          <p>Cargando reportes...</p>
        ) : filteredReports.length === 0 ? (
          <p>No tenés reportes en esta categoría.</p>
        ) : (
          filteredReports.map((item) => (
            <div className="sac-report-card" key={item.id_reporte}>
              <div className="sac-report-thumb">{item.foto ? "IMG" : "FOTO"}</div>
              <div className="sac-report-info">
                <h3>{item.titulo}</h3>
                <p>{item.direccion} • {new Date(item.fecha_reporte).toLocaleDateString("es-AR")}</p>
              </div>
              <div className={`sac-status-badge ${(item.estado || "pendiente").toLowerCase().replace(/\s+/g, "-")}`}>
                {item.estado || "Pendiente"}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}

/* Componente Principal Manejador de Vistas */
export default function App() {
  const [screen, setScreen] = useState(() => {
    const storedToken = localStorage.getItem("sac_token");
    return storedToken ? "home" : "login";
  });
  const [user, setUser] = useState(() => getStoredUser());
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ nombre: "", apellido: "", email: "", contrasena: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email,
          contrasena: loginForm.password
        })
      });

      localStorage.setItem("sac_token", data.token);
      localStorage.setItem("sac_user", JSON.stringify(data.usuario));
      setUser(data.usuario);
      setScreen("home");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre: registerForm.nombre,
          apellido: registerForm.apellido,
          email: registerForm.email,
          contrasena: registerForm.contrasena
        })
      });

      setSuccessMessage(data.mensaje || "Usuario registrado correctamente");
      setRegisterForm({ nombre: "", apellido: "", email: "", contrasena: "" });
      setTimeout(() => {
        setScreen("login");
      }, 800);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sac_token");
    localStorage.removeItem("sac_user");
    setUser(null);
    setScreen("login");
    setLoginForm({ email: "", password: "" });
  };

  useEffect(() => {
    if (!localStorage.getItem("sac_token")) return;

    async function cargarDatosUsuario() {
      try {
        const data = await apiFetch("/auth/usuario");
        setUser(data.usuario);
        localStorage.setItem("sac_user", JSON.stringify(data.usuario));
      } catch (error) {
        console.error(error);
        handleLogout();
      }
    }

    cargarDatosUsuario();
  }, []);

  if (screen === "login") {
    return (
      <Login
        goRegister={() => {
          setErrorMessage("");
          setSuccessMessage("");
          setScreen("register");
        }}
        goHome={handleLogin}
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
        goLogin={() => {
          setErrorMessage("");
          setSuccessMessage("");
          setScreen("login");
        }}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        submitting={submitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onSubmit={handleRegister}
      />
    );
  }

  if (screen === "home") {
    return <Dashboard navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  }
  if (screen === "reportar-form") {
    return <ReportForm navigateTo={setScreen} onLogout={handleLogout} />;
  }
  if (screen === "mis-reportes") {
    return <MyReports navigateTo={setScreen} onLogout={handleLogout} />;
  }
  if (screen === "mapa") {
    return <MapScreen navigateTo={setScreen} onLogout={handleLogout} />;
  }
  if (screen === "detalle-reporte") {
    return <ReportDetail navigateTo={setScreen} />;
  }
  if (screen === "perfil") {
    return <ProfileScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  }
  if (screen === "notificaciones") {
    return <NotificationsScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  }

  return (
    <Login
      goRegister={() => {
        setErrorMessage("");
        setSuccessMessage("");
        setScreen("register");
      }}
      goHome={handleLogin}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
}

/* Pantalla: Mapa (S.A.C. - Pantalla 6) */
function MapScreen({ navigateTo, onLogout }) {
  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} screenNumber="6" onLogout={onLogout}>
      <h1 className="sac-page-title">Mapa</h1>
      <p className="sac-page-subtitle">Explorá los reportes de tu zona</p>

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

function ProfileScreen({ navigateTo, user, onLogout }) {
  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} screenNumber="7" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Perfil</h1>
      <p className="sac-page-subtitle">Tus datos de cuenta</p>

      <div className="sac-form-container">
        <div className="sac-form-group">
          <label className="sac-label">Nombre</label>
          <div className="sac-textarea-wrapper">
            <p>{user?.nombre || "-"}</p>
          </div>
        </div>
        <div className="sac-form-group">
          <label className="sac-label">Apellido</label>
          <div className="sac-textarea-wrapper">
            <p>{user?.apellido || "-"}</p>
          </div>
        </div>
        <div className="sac-form-group">
          <label className="sac-label">Correo electrónico</label>
          <div className="sac-textarea-wrapper">
            <p>{user?.email || "-"}</p>
          </div>
        </div>
        <div className="sac-form-group">
          <label className="sac-label">Rol</label>
          <div className="sac-textarea-wrapper">
            <p>{user?.rol || "vecino"}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function NotificationsScreen({ navigateTo, user, onLogout }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await apiFetch("/notificaciones");
        setItems(data.notificaciones || []);
      } catch (error) {
        console.error(error);
      }
    }

    cargar();
  }, []);

  const marcarLeidas = async () => {
    try {
      await apiFetch("/notificaciones/leer", { method: "PUT" });
      const data = await apiFetch("/notificaciones");
      setItems(data.notificaciones || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppLayout activeNav="notificaciones" navigateTo={navigateTo} screenNumber="8" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Notificaciones</h1>
      <p className="sac-page-subtitle">Novedades sobre tus reportes</p>

      <button className="sac-primary-btn" type="button" onClick={marcarLeidas}>
        Marcar como leídas
      </button>

      <div className="sac-reports-list">
        {items.length === 0 ? (
          <p>No tenés notificaciones.</p>
        ) : (
          items.map((item) => (
            <div className="sac-report-card" key={item.id_notificacion}>
              <div className="sac-report-thumb">🔔</div>
              <div className="sac-report-info">
                <h3>{item.tipo || "Nuevo aviso"}</h3>
                <p>{item.mensaje}</p>
              </div>
            </div>
          ))
        )}
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

