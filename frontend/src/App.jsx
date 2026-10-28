import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "/api";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function clearStoredSession() {
  localStorage.removeItem("sac_user");
  localStorage.removeItem("sac_token");
  localStorage.removeItem("sac_session_expires_at");
}

function getStoredSession() {
  const serializedUser = localStorage.getItem("sac_user");
  const token = localStorage.getItem("sac_token");
  if (!serializedUser || !token) {
    if (serializedUser || localStorage.getItem("sac_session_expires_at")) clearStoredSession();
    return null;
  }

  let user;
  try {
    user = JSON.parse(serializedUser);
  } catch {
    clearStoredSession();
    return null;
  }

  const expiresAt = Number(localStorage.getItem("sac_session_expires_at"));
  if (!user || typeof user !== "object" || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearStoredSession();
    return null;
  }

  return { user, expiresAt };
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
    like: <><path d="M7 10v11H4V10zM7 20h9a2 2 0 0 0 2-1.6l1.5-7A2 2 0 0 0 17.5 9H13l.7-3.2A2.3 2.3 0 0 0 11.5 3L7 10" /></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.77.68 2.6.23.6.01 1.31-.53 1.78L8.7 9.29a16 16 0 0 0 6.01 6.01l1.19-1.42c.47-.54 1.18-.76 1.78-.53.83.33 1.7.56 2.6.68A2 2 0 0 1 22 16.92Z" /></>
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

function getUserDisplayName(user) {
  if (!user) return "Aisha Gomez";
  const nombre = String(user.nombre || user.name || "").trim();
  const apellido = String(user.apellido || user.lastName || "").trim();
  const email = user.email || user.correo;
  if (!nombre && !apellido && email) return String(email).split("@")[0];
  return `${nombre} ${apellido}`.trim() || "Aisha Gomez";
}

function isAdministrator(user) {
  return String(user?.rol || "").trim().toLocaleLowerCase("es") === "administrador";
}

function AppLayout({ activeNav, navigateTo, children, screenNumber, user, onLogout }) {
  const nombreUsuario = getUserDisplayName(user);
  const isAdmin = isAdministrator(user);

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
          <span className="sac-user-avatar">
            {user?.foto
              ? <img src={user.foto} alt="" className="sac-user-avatar-image" />
              : <Icon type="user" size={17} />}
          </span>
          <span className="sac-user-name">{nombreUsuario}</span>
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
            {isAdmin && (
              <button
                type="button"
                className={`sac-nav-item ${activeNav === "admin" ? "active" : ""}`}
                onClick={() => navigateTo("admin")}
              >
                <span className="sac-nav-icon"><Icon type="wrench" size={19} /></span>
                <span>Admin</span>
              </button>
            )}
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
        <div className="sac-hero-arrow" aria-hidden="true">→</div>
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
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [reportSaveError, setReportSaveError] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoNombre, setFotoNombre] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch("/categorias")
      .then((response) => {
        if (active) setCategorias(response.categorias || []);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las categorías.", error);
        if (active) setReportSaveError(error.message || "No se pudieron cargar las categorías.");
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGetLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Este navegador no permite obtener la ubicación. Ingresá la dirección manualmente.");
      return;
    }

    if (!window.isSecureContext) {
      setLocationError("Para obtener la ubicación, abrí el sitio desde una conexión segura (HTTPS) o desde localhost.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const currentCoordinates = {
          latitud: coords.latitude,
          longitud: coords.longitude
        };
        setCoordenadas(currentCoordinates);
        setUbicacion(`Mi ubicación (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`);
        setLoadingLocation(false);
      },
      (error) => {
        const messages = {
          1: "No se concedió permiso de ubicación. Podés habilitarlo en el navegador o ingresar una dirección manualmente.",
          2: "No se pudo determinar tu ubicación. Intentá nuevamente o ingresá una dirección manualmente.",
          3: "La solicitud de ubicación tardó demasiado. Intentá nuevamente o ingresá una dirección manualmente."
        };
        setLocationError(messages[error.code] || "No se pudo acceder a la ubicación. Ingresá una dirección manualmente.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFotoFile(file);
    setFotoNombre(file.name);

    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!categoria || !descripcion.trim() || !ubicacion.trim()) return;
    setReportSaveError("");
    setSubmitting(true);

    const formData = new FormData();
    const selectedCategory = categorias.find((item) => String(item.id_categoria) === categoria);
    formData.append("id_categoria", categoria);
    formData.append("titulo", `${selectedCategory?.nombre || "Reporte"}: ${descripcion.trim().slice(0, 100)}`);
    formData.append("descripcion", descripcion.trim());
    formData.append("direccion", ubicacion.trim());
    if (coordenadas) {
      formData.append("latitud", String(coordenadas.latitud));
      formData.append("longitud", String(coordenadas.longitud));
    }
    if (fotoFile) formData.append("foto", fotoFile);

    try {
      await apiFetch("/reportes/crear", {
        method: "POST",
        body: formData
      });
      navigateTo("mis-reportes");
    } catch (error) {
      console.error("No se pudo enviar el reporte.", error);
      setReportSaveError(error.message || "No se pudo enviar el reporte. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} screenNumber="4" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Reportar un problema</h1>
      <p className="sac-page-subtitle">Completá la información para enviar tu reporte</p>

      <div className="sac-report-layout">
        <div className="sac-form-container">
          <div className="sac-form-group">
            <label className="sac-label">Categoría</label>
            <div className="sac-select-wrapper">
              <select className="sac-select" value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={loadingCategories}>
                <option value="" disabled>{loadingCategories ? "Cargando categorías..." : "Elegí el tipo de problema"}</option>
                {categorias.map((item) => (
                  <option key={item.id_categoria} value={item.id_categoria}>{item.nombre}</option>
                ))}
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
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
              <span className="sac-char-count">{descripcion.length}/500</span>
            </div>
          </div>

          <div className="sac-form-group">
            <label className="sac-label" htmlFor="reporte-ubicacion">Ubicación del problema</label>
            <input
              id="reporte-ubicacion"
              className="sac-input"
              type="text"
              placeholder="Ingresá una dirección o usá tu ubicación actual"
              value={ubicacion}
              onChange={(event) => {
                setUbicacion(event.target.value);
                setCoordenadas(null);
              }}
              required
            />
            <button className="sac-location-btn" onClick={handleGetLocation} type="button" disabled={loadingLocation}>
              <Icon type="pin" size={16} />
              {loadingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
            </button>
            <p className="sac-location-description">
              El navegador te pedirá permiso para compartir tu ubicación. Si no querés habilitarla, podés escribir la dirección.
            </p>
            {coordenadas && (
              <p className="sac-location-coordinates">
                Ubicación guardada: {coordenadas.latitud.toFixed(5)}, {coordenadas.longitud.toFixed(5)}
              </p>
            )}
            {locationError && <p className="error-message" role="alert">{locationError}</p>}
          </div>

          {reportSaveError && <p className="error-message" role="alert">{reportSaveError}</p>}

          <div className="sac-form-group">
            <label className="sac-label">Agregar una foto (opcional)</label>
            <input id="reporte-foto" className="sac-file-input" type="file" accept="image/*" onChange={handlePhotoChange} />
            <label className="sac-upload-box" htmlFor="reporte-foto">
              <span className="sac-upload-icon"><Icon type="camera" size={22} /></span>
              <span className="sac-upload-copy">
                <strong>{fotoNombre || "Elegí una imagen"}</strong>
                <small>{fotoNombre ? "Seleccioná otro archivo para reemplazarla" : "JPG, PNG o GIF · hasta 5 MB"}</small>
              </span>
              <span className="sac-upload-action">{fotoNombre ? "Cambiar" : "Buscar archivo"}</span>
              {fotoPreview && <img src={fotoPreview} alt="Vista previa" className="sac-upload-preview" />}
            </label>
          </div>

          <button className="sac-primary-btn" onClick={handleSubmit} type="button" disabled={submitting || loadingCategories || !categoria || !descripcion.trim() || !ubicacion.trim()}>
            {submitting ? "Enviando..." : "Enviar reporte"}
          </button>
        </div>

        <div className="sac-categories-sidebar">
          <h3>Categorías</h3>
          <ul className="sac-categories-list">
            <li><span className="cat-icon"><Icon type="road" size={14} /></span> Calles y veredas</li>
            <li><span className="cat-icon"><Icon type="light" size={14} /></span> Alumbrado</li>
            <li><span className="cat-icon"><Icon type="trash" size={14} /></span> Basura</li>
            <li><span className="cat-icon"><Icon type="water" size={14} /></span> Agua</li>
            <li><span className="cat-icon"><Icon type="leaf" size={14} /></span> Espacios verdes</li>
            <li><span className="cat-icon"><Icon type="car" size={14} /></span> Tránsito</li>
            <li><span className="cat-icon"><Icon type="warning" size={14} /></span> Señalización</li>
            <li><span className="cat-icon"><Icon type="wrench" size={14} /></span> Otro</li>
          </ul>
          <div className="sac-plant-decoration"><Icon type="leaf" size={28} /></div>
        </div>
      </div>
    </AppLayout>
  );
}

/* Pantalla 5: Lista de Mis Reportes */
function MyReports({ navigateTo, user, onLogout }) {
  const [filter, setFilter] = useState("todos");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch("/reportes/mis-reportes")
      .then((response) => {
        if (active) setReports(response.reportes || []);
      })
      .catch((requestError) => {
        console.error("No se pudieron cargar tus reportes.", requestError);
        if (active) setError(requestError.message || "No se pudieron cargar tus reportes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = reports.filter((report) => {
    const status = String(report.estado || "").toLocaleLowerCase("es");
    if (filter === "pendientes") return status.includes("pendiente");
    if (filter === "en-proceso") return status.includes("proceso") || status.includes("curso");
    if (filter === "resueltos") return status.includes("resuelt") || status.includes("cerrad");
    return true;
  });

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLocaleLowerCase("es");
    if (normalized.includes("resuelt") || normalized.includes("cerrad")) return "status-resolved";
    if (normalized.includes("proceso") || normalized.includes("curso")) return "status-in-process";
    return "status-pending";
  };

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
        {loading && <p className="sac-admin-empty">Cargando tus reportes...</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!loading && !error && filteredReports.length === 0 && (
          <p className="sac-admin-empty">No hay reportes para mostrar en este filtro.</p>
        )}
        {filteredReports.map((item) => (
          <div className="sac-report-card clickable" key={item.id_reporte} onClick={() => navigateTo("detalle-reporte")}>
            {item.foto
              ? <img className="sac-report-thumb" src={item.foto} alt="" />
              : <div className="sac-report-thumb">S.A.C.</div>}
            <div className="sac-report-info">
              <h3>{item.titulo}</h3>
              <p>{item.direccion} • {item.fecha_reporte ? new Date(item.fecha_reporte).toLocaleDateString("es-AR") : ""}</p>
              {item.estado_revision === "pendiente" && <span className="sac-review-status pendiente">En revisión administrativa</span>}
              {item.estado_revision === "rechazado" && <span className="sac-review-status rechazado">No aprobado para publicación</span>}
            </div>
            <div className={`sac-status-badge ${getStatusClass(item.estado)}`}>{item.estado}</div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

/* Pantalla 6: Mapa */
function MapScreen({ navigateTo, user, onLogout }) {
  const [searchText, setSearchText] = useState("Benito Juárez, Buenos Aires, Argentina");
  const [mapLocation, setMapLocation] = useState("Benito Juárez, Buenos Aires, Argentina");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=16&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`;

  useEffect(() => {
    let active = true;
    apiFetch("/reportes/todos")
      .then((response) => {
        if (active) setReports(response.reportes || []);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los reportes publicados.", error);
        if (active) setReportsError(error.message || "No se pudieron cargar los reportes.");
      })
      .finally(() => {
        if (active) setLoadingReports(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const location = searchText.trim();
    if (location) {
      setMapLocation(location);
      setSelectedReportId(null);
    }
  };

  const handleSelectReport = (report) => {
    const hasCoordinates = report.latitud !== null
      && report.latitud !== undefined
      && report.longitud !== null
      && report.longitud !== undefined;
    const latitud = hasCoordinates ? Number(report.latitud) : NaN;
    const longitud = hasCoordinates ? Number(report.longitud) : NaN;
    const location = hasCoordinates && Number.isFinite(latitud) && Number.isFinite(longitud)
      ? `${latitud},${longitud}`
      : report.direccion || "Benito Juárez, Buenos Aires, Argentina";
    setMapLocation(location);
    setSearchText(report.direccion || location);
    setSelectedReportId(report.id_reporte);
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLocaleLowerCase("es");
    if (normalized.includes("resuelt") || normalized.includes("cerrad")) return "status-resolved";
    if (normalized.includes("proceso") || normalized.includes("curso")) return "status-in-process";
    return "status-pending";
  };

  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} screenNumber="6" user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Mapa</h1>
      <p className="sac-page-subtitle">Buscá una dirección o localidad y explorala directamente en Google Maps.</p>

      <form className="sac-map-search-form" onSubmit={handleSearch}>
        <label className="sac-map-search-label" htmlFor="map-location">Ubicación</label>
        <div className="sac-map-search-controls">
          <input
            id="map-location"
            className="sac-map-search-input"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Ej.: Calle 12 y 5, localidad"
            aria-label="Buscar una dirección o localidad en el mapa"
          />
          <button className="sac-map-link sac-map-search-button" type="submit">Buscar en el mapa</button>
        </div>
      </form>

      <div className="sac-map-canvas">
        <iframe
          className="sac-google-map"
          src={mapEmbedUrl}
          title={`Google Maps: ${mapLocation}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="sac-map-location-note">
        Mapa disponible para todas las cuentas. También podés{" "}
        <a className="sac-map-open-link" href={mapSearchUrl} target="_blank" rel="noreferrer">
          abrir esta ubicación en Google Maps
        </a>.
      </p>

      <section className="sac-map-reports-section" aria-labelledby="map-reports-title">
        <div className="sac-map-reports-header">
          <div>
            <h2 id="map-reports-title">Reportes del barrio</h2>
            <p>Seleccioná un reporte para ubicar su dirección en el mapa.</p>
          </div>
          <span className="sac-map-reports-count">{loadingReports ? "Cargando..." : `${reports.length} reportes`}</span>
        </div>

        <div className="sac-map-reports-list">
          {reportsError && <p className="error-message" role="alert">{reportsError}</p>}
          {!loadingReports && !reportsError && reports.length === 0 && (
            <p className="sac-admin-empty">Todavía no hay reportes aprobados para publicar.</p>
          )}
          {reports.map((report) => (
            <button
              className={`sac-map-report-item ${selectedReportId === report.id_reporte ? "selected" : ""}`}
              key={report.id_reporte}
              onClick={() => handleSelectReport(report)}
              type="button"
              aria-pressed={selectedReportId === report.id_reporte}
            >
              <span className="sac-map-report-pin"><Icon type="pin" size={19} /></span>
              <span className="sac-map-report-details">
                <strong>{report.titulo}</strong>
                <span className="sac-map-report-location">{report.direccion || "Ubicación no informada"}</span>
                <span className="sac-map-report-date">{report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : ""}</span>
              </span>
              <span className={`sac-status-badge ${getStatusClass(report.estado)}`}>{report.estado}</span>
            </button>
          ))}
        </div>
      </section>
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
    { num: 1, icon: "pin", title: "Identificá el problema", desc: "Observá cualquier desperfecto o eventualidad en la vía pública como baches, alumbrado, basura o falta de señalización." },
    { num: 2, icon: "camera", title: "Creá tu reporte", desc: "Ingresá a Reportar un problema, elegí la categoría adecuada y escribí una descripción clara con detalles útiles." },
    { num: 3, icon: "map", title: "Marcá la ubicación", desc: "Usá el mapa o la dirección para registrar exactamente dónde está el problema para que pueda ser atendido." },
    { num: 4, icon: "clipboard", title: "Hacé seguimiento", desc: "Consultá el avance de cada caso en Mis reportes y enterate del estado desde Notificaciones." },
    { num: 5, icon: "heart", title: "Apoyá la comunidad", desc: "Visitá el Mapa y apoyá reportes de otros vecinos para que el problema tenga más visibilidad." }
  ];

  return (
    <AppLayout activeNav="guia" navigateTo={navigateTo} screenNumber="9" user={user} onLogout={onLogout}>
      <div className="sac-guide-page-heading">
        <span className="sac-guide-eyebrow">CENTRO DE AYUDA</span>
        <h1 className="sac-page-title">Guía de uso</h1>
        <p className="sac-page-subtitle">Una guía simple para reportar y hacer seguimiento de los problemas del barrio.</p>
      </div>

      <div className="sac-guide-hero">
        <div className="sac-guide-hero-copy">
          <span className="sac-guide-hero-icon"><Icon type="book" size={25} /></span>
          <div>
            <span className="sac-guide-hero-label">S.A.C. · Sistema de Atención Ciudadana</span>
          <h2>¿Cómo funciona el S.A.C.?</h2>
          <p>Esta plataforma te permite reportar incidencias del barrio de forma simple, ordenada y visible para la comunidad.</p>
          </div>
        </div>
        <div className="sac-guide-hero-aside">
          <strong>5 pasos</strong>
          <span>para completar tu reporte</span>
        </div>
      </div>

      <div className="sac-guide-steps-list">
        <div className="sac-guide-section-heading">
          <div>
            <span className="sac-guide-eyebrow">EMPEZÁ ACÁ</span>
            <h2>De la observación al seguimiento</h2>
          </div>
          <p>Seguí estos pasos para que tu aviso llegue con toda la información necesaria.</p>
        </div>
        {pasos.map((step) => (
          <div className="sac-guide-step-card" key={step.num}>
            <div className="sac-guide-step-marker">
              <span className="sac-guide-step-number">{step.num}</span>
            </div>
            <span className="sac-guide-step-icon"><Icon type={step.icon} size={19} /></span>
            <div className="sac-guide-step-content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sac-guide-footer-card">
        <span className="sac-guide-footer-icon"><Icon type="megaphone" size={22} /></span>
        <div className="sac-guide-footer-copy">
          <h3>¿Necesitás reportar un problema ahora?</h3>
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
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    setNombre(user?.nombre || "Aisha");
    setApellido(user?.apellido || "Gomez");
    setEmail(user?.email || "aisha@gmail.com");
    setFoto(user?.foto || null);
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    const updated = {
      ...user,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      foto
    };

    try {
      await apiFetch("/perfil/editar", {
        method: "PUT",
        body: JSON.stringify({
          nombre: updated.nombre,
          apellido: updated.apellido,
          email: updated.email
        })
      });
      localStorage.setItem("sac_user", JSON.stringify(updated));
    } catch (error) {
      console.error("No se pudo actualizar el perfil.", error);
      setProfileError(error.message || "No se pudieron guardar los cambios. Intentá nuevamente.");
      return;
    }

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
      {profileError && <p className="error-message" role="alert">{profileError}</p>}

      {!isEditing ? (
        <>
          <div className="sac-profile-card-header">
            <div className="sac-profile-avatar-large">
              {foto ? <img src={foto} alt="Avatar" className="sac-avatar-img" /> : <span><Icon type="user" size={26} /></span>}
            </div>
            <div>
              <h2>{nombre} {apellido}</h2>
              <p>{email}</p>
            </div>
          </div>

          <div className="sac-profile-menu-list">
            <button className="sac-profile-menu-item" onClick={() => setIsEditing(true)} type="button">
              <span className="p-icon"><Icon type="user" size={16} /></span>
              <span>Editar perfil</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("cambiar-contrasena")} type="button">
              <span className="p-icon"><Icon type="lock" size={16} /></span>
              <span>Cambiar contraseña</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("mis-reportes")} type="button">
              <span className="p-icon"><Icon type="file" size={16} /></span>
              <span>Mis reportes</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" onClick={() => navigateTo("notificaciones")} type="button">
              <span className="p-icon"><Icon type="bell" size={16} /></span>
              <span>Notificaciones</span>
              <span className="p-arrow">›</span>
            </button>
            <button className="sac-profile-menu-item" type="button">
              <span className="p-icon"><Icon type="phone" size={16} /></span>
              <span>Contacto</span>
              <span className="p-arrow">›</span>
            </button>
          </div>
        </>
      ) : (
        <form className="sac-form-container" onSubmit={handleSaveProfile}>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="perfil-foto">Foto de perfil</label>
            <input id="perfil-foto" type="file" accept="image/*" onChange={handlePhotoChange} className="sac-file-input" />
            <label className="sac-profile-upload" htmlFor="perfil-foto">
              <span className="sac-profile-upload-preview">
                {foto ? <img src={foto} alt="" /> : <Icon type="user" size={22} />}
              </span>
              <span className="sac-upload-copy">
                <strong>{foto ? "Foto seleccionada" : "Agregá una foto de perfil"}</strong>
                <small>Elegí una imagen desde tu dispositivo</small>
              </span>
              <span className="sac-upload-action">{foto ? "Cambiar" : "Elegir foto"}</span>
            </label>
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

function AdminScreen({ navigateTo, user, onLogout }) {
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState("");

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      setLoading(true);
      setError("");

      try {
        const [reportsResponse, usersResponse, statesResponse] = await Promise.all([
          apiFetch("/admin/reportes"),
          apiFetch("/admin/usuarios"),
          apiFetch("/admin/estados")
        ]);
        if (!active) return;
        setReportes(reportsResponse.reportes || []);
        setUsuarios(usersResponse.usuarios || []);
        setEstados(statesResponse.estados || []);
      } catch (requestError) {
        console.error("No se pudieron cargar los datos de administración.", requestError);
        if (active) setError(requestError.message || "No se pudieron cargar los datos reales.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAdminData();
    return () => {
      active = false;
    };
  }, []);

  const normalizeStatus = (status) => String(status || "").trim().toLocaleLowerCase("es");
  const pendingCount = reportes.filter((report) => normalizeStatus(report.estado).includes("pendiente")).length;
  const inProgressCount = reportes.filter((report) => {
    const status = normalizeStatus(report.estado);
    return status.includes("proceso") || status.includes("curso");
  }).length;
  const resolvedCount = reportes.filter((report) => {
    const status = normalizeStatus(report.estado);
    return status.includes("resuelt") || status.includes("cerrad") || status.includes("completad");
  }).length;
  const approvalCount = reportes.filter((report) => report.estado_revision === "pendiente").length;
  const stats = [
    { label: "Reportes totales", value: reportes.length, detail: "Total registrado" },
    { label: "Por autorizar", value: approvalCount, detail: "Esperan decisión administrativa" },
    { label: "Pendientes", value: pendingCount, detail: "Según estado actual" },
    { label: "En proceso", value: inProgressCount, detail: "Según estado actual" },
    { label: "Resueltos", value: resolvedCount, detail: "Según estado actual" },
    { label: "Usuarios registrados", value: usuarios.length, detail: "Total de cuentas" }
  ];

  const filteredReports = reportes.filter((report) => {
    const searchable = `${report.id_reporte} ${report.titulo} ${report.direccion} ${report.vecino} ${report.estado}`.toLocaleLowerCase("es");
    const matchesSearch = searchable.includes(search.toLocaleLowerCase("es"));
    const status = normalizeStatus(report.estado);
    const matchesFilter = filter === "todos"
      || (filter === "pendientes" && status.includes("pendiente"))
      || (filter === "proceso" && (status.includes("proceso") || status.includes("curso")))
      || (filter === "resueltos" && (status.includes("resuelt") || status.includes("cerrad") || status.includes("completad")));
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (reportId, estadoId) => {
    setError("");
    setUpdatingReportId(reportId);
    try {
      await apiFetch(`/admin/reportes/${reportId}/estado`, {
        method: "PUT",
        body: JSON.stringify({ id_estado: Number(estadoId) })
      });
      const newStatus = estados.find((state) => String(state.id_estado) === String(estadoId));
      if (newStatus) {
        setReportes((current) => current.map((report) => (
          report.id_reporte === reportId ? { ...report, estado: newStatus.nombre } : report
        )));
      }
    } catch (requestError) {
      console.error(`No se pudo actualizar el estado del reporte ${reportId}.`, requestError);
      setError(requestError.message || "No se pudo actualizar el estado del reporte.");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleApproval = async (reportId, decision) => {
    setError("");
    setUpdatingReportId(reportId);
    try {
      await apiFetch(`/admin/reportes/${reportId}/aprobacion`, {
        method: "PUT",
        body: JSON.stringify({ decision })
      });
      setReportes((current) => current.map((report) => (
        report.id_reporte === reportId
          ? { ...report, estado_revision: decision }
          : report
      )));
    } catch (requestError) {
      console.error(`No se pudo guardar la decisión del reporte ${reportId}.`, requestError);
      setError(requestError.message || "No se pudo guardar la decisión del reporte.");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm(`¿Eliminar el reporte “${report.titulo}” y sus comentarios y apoyos? Esta acción no se puede deshacer.`)) return;

    setError("");
    setDeletingRecord(`reporte-${report.id_reporte}`);
    try {
      await apiFetch(`/admin/reportes/${report.id_reporte}`, { method: "DELETE" });
      setReportes((current) => current.filter((item) => item.id_reporte !== report.id_reporte));
    } catch (requestError) {
      console.error(`No se pudo eliminar el reporte ${report.id_reporte}.`, requestError);
      setError(requestError.message || "No se pudo eliminar el reporte.");
    } finally {
      setDeletingRecord("");
    }
  };

  const handleDeleteUser = async (registeredUser) => {
    const userName = `${registeredUser.nombre || ""} ${registeredUser.apellido || ""}`.trim() || registeredUser.email;
    if (!window.confirm(`¿Eliminar a ${userName}, todos sus reportes, comentarios y apoyos? Esta acción no se puede deshacer.`)) return;

    setError("");
    setDeletingRecord(`usuario-${registeredUser.id_usuario}`);
    try {
      await apiFetch(`/admin/usuarios/${registeredUser.id_usuario}`, { method: "DELETE" });
      setUsuarios((current) => current.filter((item) => item.id_usuario !== registeredUser.id_usuario));
      setReportes((current) => current.filter((item) => item.id_usuario !== registeredUser.id_usuario));
    } catch (requestError) {
      console.error(`No se pudo eliminar el usuario ${registeredUser.id_usuario}.`, requestError);
      setError(requestError.message || "No se pudo eliminar el usuario.");
    } finally {
      setDeletingRecord("");
    }
  };

  return (
    <AppLayout activeNav="admin" navigateTo={navigateTo} screenNumber="10" user={user} onLogout={onLogout}>
      <div className="sac-admin-section">
        <div className="sac-admin-header">
          <div>
            <span className="sac-admin-eyebrow">Panel administrativo</span>
            <h1 className="sac-page-title">Administración</h1>
          </div>
          <div className="sac-admin-role"><Icon type="wrench" size={15} /> Administrador</div>
        </div>
      </div>

      <div className="sac-admin-stats">
        {stats.map((stat) => (
          <div className="sac-admin-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{loading ? "—" : stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="sac-admin-section">
        <div className="sac-admin-section-header">
          <div>
            <h2>Reportes recientes</h2>
            <p>Datos y estados obtenidos del sistema</p>
          </div>
          <div className="sac-admin-report-tools">
            <label className="sac-admin-search">
              <Icon type="map" size={14} />
              <input
                type="search"
                placeholder="Buscar reporte"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select className="sac-admin-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="todos">Todos</option>
              <option value="pendientes">Pendientes</option>
              <option value="proceso">En proceso</option>
              <option value="resueltos">Resueltos</option>
            </select>
          </div>
        </div>

        <div className="sac-admin-list">
          {loading && <p className="sac-admin-empty">Cargando datos de administración...</p>}
          {!loading && filteredReports.length === 0 && (
            <p className="sac-admin-empty">No hay reportes que coincidan con la búsqueda.</p>
          )}
          {filteredReports.map((report) => {
            const currentState = estados.find((state) => state.nombre === report.estado);
            return (
              <div className="sac-admin-row" key={report.id_reporte}>
                <div>
                  <strong>#{report.id_reporte} · {report.titulo}</strong>
                  <span>{report.direccion || "Ubicación no informada"} · {report.vecino || "Vecino"}</span>
                  <span>{report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : "Fecha no disponible"}</span>
                  {report.descripcion && <span>{report.descripcion}</span>}
                  <span className={`sac-review-status ${report.estado_revision}`}>
                    Revisión: {report.estado_revision === "aprobado" ? "Aprobado" : report.estado_revision === "rechazado" ? "Rechazado" : "Pendiente"}
                  </span>
                </div>
                <div className="sac-admin-control">
                  {report.estado_revision === "pendiente" && (
                    <div className="sac-admin-approval-actions">
                      <button
                        className="sac-approval-btn approve"
                        type="button"
                        onClick={() => handleApproval(report.id_reporte, "aprobado")}
                        disabled={updatingReportId === report.id_reporte || Boolean(deletingRecord)}
                      >
                        Aprobar y publicar
                      </button>
                      <button
                        className="sac-approval-btn reject"
                        type="button"
                        onClick={() => handleApproval(report.id_reporte, "rechazado")}
                        disabled={updatingReportId === report.id_reporte || Boolean(deletingRecord)}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  <select
                    className="sac-select"
                    value={currentState?.id_estado || ""}
                    onChange={(event) => handleStatusChange(report.id_reporte, event.target.value)}
                    disabled={updatingReportId === report.id_reporte || Boolean(deletingRecord) || estados.length === 0}
                    aria-label={`Cambiar estado del reporte ${report.id_reporte}`}
                  >
                    {currentState && <option value={currentState.id_estado}>{currentState.nombre}</option>}
                    {estados.filter((state) => state.id_estado !== currentState?.id_estado).map((state) => (
                      <option key={state.id_estado} value={state.id_estado}>{state.nombre}</option>
                    ))}
                  </select>
                  <button
                    className="sac-delete-btn"
                    type="button"
                    onClick={() => handleDeleteReport(report)}
                    disabled={Boolean(deletingRecord)}
                  >
                    {deletingRecord === `reporte-${report.id_reporte}` ? "Eliminando..." : "Eliminar reporte"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sac-admin-section sac-admin-users-section">
        <div className="sac-admin-section-header">
          <div>
            <h2>Registro de usuarios</h2>
            <p>Listado completo de cuentas registradas</p>
          </div>
          <span className="sac-map-reports-count">{loading ? "Cargando..." : `${usuarios.length} usuarios`}</span>
        </div>
        <div className="sac-admin-users-list">
          {!loading && usuarios.length === 0 && (
            <p className="sac-admin-empty">No hay usuarios registrados.</p>
          )}
          {usuarios.map((registeredUser) => (
            <div className="sac-admin-user-row" key={registeredUser.id_usuario}>
              <span className="sac-user-avatar"><Icon type="user" size={17} /></span>
              <span className="sac-admin-user-details">
                <strong>{`${registeredUser.nombre || ""} ${registeredUser.apellido || ""}`.trim() || "Sin nombre"}</strong>
                <span>{registeredUser.email}</span>
              </span>
              <span className="sac-admin-user-role">{registeredUser.rol}</span>
              <span className="sac-admin-user-date">
                {registeredUser.fecha_registro ? new Date(registeredUser.fecha_registro).toLocaleDateString("es-AR") : "Fecha no disponible"}
              </span>
              <button
                className="sac-delete-btn"
                type="button"
                onClick={() => handleDeleteUser(registeredUser)}
                disabled={Boolean(deletingRecord) || String(registeredUser.id_usuario) === String(user?.id_usuario)}
                title={String(registeredUser.id_usuario) === String(user?.id_usuario) ? "No podés eliminar tu propia cuenta" : "Eliminar usuario y sus datos asociados"}
              >
                {deletingRecord === `usuario-${registeredUser.id_usuario}` ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

/* Componente Principal App */
export default function App() {
  const [initialSession] = useState(() => getStoredSession());
  const [screen, setScreen] = useState(initialSession ? "home" : "login");
  const [user, setUser] = useState({
    ...(initialSession?.user || {
      nombre: "Aisha",
      apellido: "Gomez",
      email: "aisha@gmail.com",
      foto: null,
      rol: "administrador"
    })
  });
  const [sessionExpiresAt, setSessionExpiresAt] = useState(initialSession?.expiresAt || null);
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

  useEffect(() => {
    if (!sessionExpiresAt) return undefined;

    let timeoutId;
    const expireSession = () => {
      const remaining = sessionExpiresAt - Date.now();
      if (remaining > 0) {
        timeoutId = window.setTimeout(expireSession, Math.min(remaining, 2147483647));
        return;
      }

      clearStoredSession();
      setSessionExpiresAt(null);
      setScreen("login");
      setErrorMessage("Tu sesión venció. Iniciá sesión nuevamente.");
    };

    timeoutId = window.setTimeout(
      expireSession,
      Math.min(sessionExpiresAt - Date.now(), 2147483647)
    );
    return () => window.clearTimeout(timeoutId);
  }, [sessionExpiresAt]);

  useEffect(() => {
    if (!initialSession) return undefined;

    let active = true;
    const refreshUser = async () => {
      try {
        const response = await apiFetch("/auth/usuario");
        if (active && response.usuario) setUser(response.usuario);
      } catch (error) {
        if (!active) return;
        console.error("No se pudo actualizar el usuario de la sesión.", error);
        if (error.status === 401) {
          clearStoredSession();
          setSessionExpiresAt(null);
          setScreen("login");
          setErrorMessage("Tu sesión venció o dejó de ser válida. Iniciá sesión nuevamente.");
        }
      }
    };

    refreshUser();
    return () => {
      active = false;
    };
  }, [initialSession]);

  useEffect(() => {
    if (sessionExpiresAt && sessionExpiresAt > Date.now()) {
      localStorage.setItem("sac_user", JSON.stringify(user));
      localStorage.setItem("sac_session_expires_at", String(sessionExpiresAt));
    }
  }, [user, sessionExpiresAt]);

  const handleLoginSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email,
          contrasena: loginForm.password
        })
      });

      if (!response.token || !response.usuario) {
        throw new Error("El servidor no devolvió los datos de inicio de sesión.");
      }

      localStorage.setItem("sac_token", response.token);
      setUser(response.usuario);
      setSessionExpiresAt(Date.now() + SESSION_DURATION_MS);
      setScreen("home");
    } catch (error) {
      console.error("No se pudo iniciar sesión.", error);
      setErrorMessage(error.message || "No se pudo iniciar sesión. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre: registerForm.nombre,
          apellido: registerForm.apellido,
          email: registerForm.email,
          contrasena: registerForm.contrasena
        })
      });
      setSuccessMessage(response.mensaje || "¡Cuenta creada con éxito!");
      setLoginForm((previous) => ({ ...previous, email: registerForm.email, password: "" }));
      setTimeout(() => {
        setScreen("login");
        setSuccessMessage("");
      }, 1000);
    } catch (error) {
      console.error("No se pudo registrar la cuenta.", error);
      setErrorMessage(error.message || "No se pudo crear la cuenta. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setSessionExpiresAt(null);
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
  if (screen === "admin") {
    if (isAdministrator(user)) {
      return <AdminScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
    }
    return <Dashboard navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  }

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