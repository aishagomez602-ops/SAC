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

function getReportCoordinates(report) {
  if (
    report?.latitud === null || report?.latitud === undefined || report.latitud === "" ||
    report?.longitud === null || report?.longitud === undefined || report.longitud === ""
  ) {
    return null;
  }

  const latitude = Number(report.latitud);
  const longitude = Number(report.longitud);
  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
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
        {/* Sidebar Left Navigation */}
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
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("mapa")}>
              <span className="sac-nav-icon"><Icon type="map" size={19} /></span>
              <span>Mapa</span>
            </button>
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("notificaciones")}>
              <span className="sac-nav-icon"><Icon type="bell" size={19} /></span>
              <span>Notificaciones</span>
            </button>
            <button type="button" className="sac-nav-item" onClick={() => navigateTo("perfil")}>
              <span className="sac-nav-icon"><Icon type="user" size={19} /></span>
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
          <div className="sac-megaphone-icon"><Icon type="megaphone" size={27} /></div>
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
          <div className="sac-dash-card-icon orange-bg"><Icon type="clipboard" size={21} /></div>
          <h3>Mis reportes</h3>
          <p>Revisá el estado de tus reportes</p>
        </div>

        <div className="sac-dash-card" onClick={() => navigateTo("mapa")}>
          <div className="sac-dash-card-icon orange-bg"><Icon type="pin" size={21} /></div>
          <h3>Problemas del barrio</h3>
          <p>Conocé los problemas más comunes</p>
        </div>

        <div className="sac-dash-card">
          <div className="sac-dash-card-icon orange-bg"><Icon type="book" size={21} /></div>
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
              <div className="sac-camera-icon"><Icon type="camera" size={23} /></div>
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
            <li><span className="cat-icon"><Icon type="road" size={17} /></span> Calles y veredas</li>
            <li><span className="cat-icon"><Icon type="light" size={17} /></span> Alumbrado</li>
            <li><span className="cat-icon"><Icon type="trash" size={17} /></span> Basura</li>
            <li><span className="cat-icon"><Icon type="water" size={17} /></span> Agua</li>
            <li><span className="cat-icon"><Icon type="leaf" size={17} /></span> Espacios verdes</li>
            <li><span className="cat-icon"><Icon type="car" size={17} /></span> Tránsito</li>
            <li><span className="cat-icon"><Icon type="warning" size={17} /></span> Señalización</li>
            <li><span className="cat-icon"><Icon type="wrench" size={17} /></span> Otro</li>
          </ul>

          <div className="sac-plant-decoration"><Icon type="leaf" size={26} /></div>
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
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function cargarReportes() {
      try {
        const data = await apiFetch("/reportes/todos");
        const loadedReports = data.reportes || [];
        setReports(loadedReports);
        const firstReportWithLocation = loadedReports.find((report) => getReportCoordinates(report));
        setSelectedReportId(firstReportWithLocation?.id_reporte ?? loadedReports[0]?.id_reporte ?? null);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    cargarReportes();
  }, []);

  const reportsWithLocation = reports.filter((report) => getReportCoordinates(report));
  const selectedReport = reports.find((report) => report.id_reporte === selectedReportId) || reportsWithLocation[0] || reports[0];
  const selectedCoordinates = getReportCoordinates(selectedReport);
  const googleMapsUrl = selectedCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedCoordinates.latitude},${selectedCoordinates.longitude}`)}`
    : null;

  const getStatusClass = (status) => {
    const normalizedStatus = (status || "pendiente").toLowerCase();
    if (normalizedStatus.includes("resuelt")) return "green";
    if (normalizedStatus.includes("proceso")) return "yellow";
    return "red";
  };

  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} screenNumber="6" onLogout={onLogout}>
      <h1 className="sac-page-title">Mapa</h1>
      <p className="sac-page-subtitle">Seleccioná un reporte para ver su ubicación en Google Maps</p>

      <div className="sac-map-canvas">
        {loading ? (
          <p className="sac-map-empty">Cargando mapa y ubicaciones...</p>
        ) : selectedCoordinates ? (
          <iframe
            className="sac-google-map"
            title={`Ubicación del reporte: ${selectedReport.titulo}`}
            src={`https://maps.google.com/maps?q=${selectedCoordinates.latitude},${selectedCoordinates.longitude}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="sac-map-empty">
            {reports.length === 0
              ? "Todavía no hay problemas reportados."
              : "Este reporte no tiene una ubicación cargada."}
          </p>
        )}
      </div>

      {loading ? (
        <p>Cargando problemas del barrio...</p>
      ) : errorMessage ? (
        <p role="alert">No se pudieron cargar los reportes: {errorMessage}</p>
      ) : reports.length === 0 ? (
        <p>Todavía no hay problemas reportados.</p>
      ) : (
        <>
          {selectedReport && (
            <div className="sac-map-preview-card">
              <div className="sac-report-thumb">{selectedReport.foto ? "IMG" : <Icon type="pin" size={19} />}</div>
              <div className="sac-report-info">
                <h3>{selectedReport.titulo}</h3>
                <p>{selectedReport.direccion} • {new Date(selectedReport.fecha_reporte).toLocaleDateString("es-AR")}</p>
                <span className={`sac-status-badge status-${getStatusClass(selectedReport.estado) === "red" ? "pending" : getStatusClass(selectedReport.estado) === "yellow" ? "in-process" : "resolved"} small-badge`}>
                  {selectedReport.estado || "Pendiente"}
                </span>
              </div>
              {googleMapsUrl && (
                <a className="sac-map-link" href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Abrir en Google Maps
                </a>
              )}
            </div>
          )}

          {reportsWithLocation.length === 0 && (
            <p className="sac-map-location-note">
              Los reportes todavía no tienen coordenadas. Cuando se cargue una ubicación, aparecerá en el mapa.
            </p>
          )}

          <div className="sac-reports-list">
            {reports.map((report) => (
              <button
                className={`sac-report-card clickable ${selectedReport?.id_reporte === report.id_reporte ? "selected" : ""}`}
                key={report.id_reporte}
                type="button"
                onClick={() => setSelectedReportId(report.id_reporte)}
              >
                <div className="sac-report-info">
                  <h3>{report.titulo}</h3>
                  <p>{report.direccion} • {new Date(report.fecha_reporte).toLocaleDateString("es-AR")}</p>
                  <span className="sac-map-location-label">
                    {getReportCoordinates(report) ? "Ver ubicación en el mapa" : "Ubicación no disponible"}
                  </span>
                </div>
                <span className={`sac-status-badge status-${getStatusClass(report.estado) === "red" ? "pending" : getStatusClass(report.estado) === "yellow" ? "in-process" : "resolved"}`}>
                  {report.estado || "Pendiente"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
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
              <div className="sac-report-thumb"><Icon type="bell" size={19} /></div>
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

      <div className="sac-detail-ca  rd">
        {/* Banner de Imagen Principal */}
        <div className="sac-detail-photo-placeholder">
          <span>FOTO DEL REPORTE</span>
        </div>

        {/* Encabezado e Info Principal */}
        <h2 className="sac-detail-title">Bache en Av. 2</h2>
        
        <div className="sac-detail-meta-bar">
          <div className="sac-meta-item">
            <span className="sac-meta-icon"><Icon type="pin" size={16} /></span>
            <span>Calle 12 y 5</span>
          </div>
          <div className="sac-meta-item">
            <span className="sac-meta-icon"><Icon type="calendar" size={16} /></span>
            <span>08/09/2026</span>
          </div>
          <div className="sac-meta-item">
            <span className="sac-meta-icon"><Icon type="heart" size={16} /></span>
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
          <span className="sac-like-icon"><Icon type="like" size={18} /></span>
          <span>{hasLiked ? "Reporte apoyado" : "Apoyar reporte"}</span>
        </button>
      </div>
    </AppLayout>
  );
}
