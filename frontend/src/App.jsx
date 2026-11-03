import { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "/api";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_MIN_LENGTH = 12;

function getPasswordRequirements(password) {
  const byteLength = new TextEncoder().encode(password).length;
  return [
    { label: "Entre 12 y 72 caracteres", met: password.length >= PASSWORD_MIN_LENGTH && password.length <= 72 },
    { label: "Al menos una mayúscula", met: /\p{Lu}/u.test(password) },
    { label: "Al menos una minúscula", met: /\p{Ll}/u.test(password) },
    { label: "Al menos un número", met: /\p{N}/u.test(password) },
    { label: "Al menos un símbolo (no cuenta el espacio)", met: /[^\p{L}\p{N}\s]/u.test(password) },
    { label: "Máximo 72 bytes", met: byteLength <= 72 }
  ];
}

function PasswordRequirements({ password }) {
  return (
    <ul className="password-requirements" aria-label="Requisitos de contraseña">
      {getPasswordRequirements(password).map(({ label, met }) => (
        <li className={met ? "password-requirement-met" : ""} key={label}>
          <span aria-hidden="true">{met ? "✓" : "○"}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function isStrongPassword(password) {
  return getPasswordRequirements(password).every(({ met }) => met);
}

function clearStoredSession() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("sac_user");
    storage.removeItem("sac_token");
    storage.removeItem("sac_session_expires_at");
  }
}

function clearSession(storage) {
  storage.removeItem("sac_user");
  storage.removeItem("sac_token");
  storage.removeItem("sac_session_expires_at");
}

function getSessionStorage() {
  return localStorage.getItem("sac_token") ? localStorage : sessionStorage;
}

function getStoredSession() {
  for (const [storage, remember] of [[localStorage, true], [sessionStorage, false]]) {
    const serializedUser = storage.getItem("sac_user");
    const token = storage.getItem("sac_token");
    const expiresAt = Number(storage.getItem("sac_session_expires_at"));
    if (!serializedUser || !token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      if (serializedUser || token || storage.getItem("sac_session_expires_at")) clearSession(storage);
      continue;
    }

    try {
      const user = JSON.parse(serializedUser);
      if (user && typeof user === "object" && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
        return { user, expiresAt, remember };
      }
    } catch {
      clearSession(storage);
    }
    clearSession(storage);
  }

  return null;
}

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("sac_token") || sessionStorage.getItem("sac_token");
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
    const error = new Error(message);
    error.status = response.status;
    throw error;
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
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
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

function getReportPhotoUrl(photo) {
  if (typeof photo !== "string" || !photo.trim()) return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  return `/${photo.replace(/^\/+/, "")}`;
}

function getReportLocation(report) {
  const address = String(report.direccion || "").trim();
  const isLegacyGpsLabel = /^mi ubicación\s*\(-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?\)$/i.test(address);
  if (address && !isLegacyGpsLabel) {
    return {
      query: `${address}, Benito Juárez, Buenos Aires, Argentina`,
      searchText: address
    };
  }

  const latitud = Number(report.latitud);
  const longitud = Number(report.longitud);
  const hasCoordinates = report.latitud !== null
    && report.latitud !== undefined
    && report.longitud !== null
    && report.longitud !== undefined
    && Number.isFinite(latitud)
    && Number.isFinite(longitud)
    && latitud >= -90
    && latitud <= 90
    && longitud >= -180
    && longitud <= 180;

  if (hasCoordinates) {
    const coordinates = `${latitud},${longitud}`;
    return { query: coordinates, searchText: coordinates };
  }

  const fallback = "Benito Juárez, Buenos Aires, Argentina";
  return {
    query: fallback,
    searchText: fallback
  };
}

function ReportPhoto({ photo, className, alt }) {
  const [failed, setFailed] = useState(false);
  const src = getReportPhotoUrl(photo);

  if (!src || failed) {
    return (
      <span className={`${className} sac-report-photo-fallback`} role="img" aria-label="Foto no disponible">
        <Icon type="camera" size={20} />
        <span>Sin foto</span>
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <div className="Logo">
        <img src="/images/fabicon,fondo.jpeg" alt=""/>
      </div>
    </div>
  );
}

function CommunityIllustration({ variant }) {
  return (
    <div className={`community-art community-art-${variant}`} aria-hidden="true">
      <img
        src={variant === "login"
          ? "/images%20copy/imagen%20para%20el%20inicio%20de%20sesion.png"
          : "/images%20copy/imagen%20para%20el%20registro.png"}
        alt=""
      />
    </div>
  );
}

function Field({ icon, type = "text", placeholder, name, value, onChange, autoComplete, required = false, minLength, maxLength, inputMode, pattern }) {
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
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
      />
    </div>
  );
}

function Login({ goRegister, goContact, loginForm, setLoginForm, rememberMe, setRememberMe, onSubmit, submitting, errorMessage }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />

      <main className="layout login-layout">
        <section className="presentation login-presentation">
          <Logo />
          <h1>Una comunidad mejor<br />también depende<br /><strong>de VOS</strong></h1>
          <p>Reportá problemas y ayudá a construir una comunidad<br />más ordenada y cuidada para todos.</p>
          <CommunityIllustration variant="login" />
        </section>

        <section className="card login-card">
          <h2>Iniciar sesión</h2>
          <p className="card-description">Ingresá a tu cuenta para continuar</p>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <Field icon="mail" type="email" name="email" placeholder="Correo electrónico" value={loginForm.email} onChange={handleChange} autoComplete="email" maxLength={254} required />
            <Field icon="lock" type="password" name="password" placeholder="Contraseña" value={loginForm.password} onChange={handleChange} autoComplete="current-password" maxLength={72} required />

            <div className="form-options">
              <label className="remember">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>Recordarme</span>
              </label>
              <button type="button" className="text-button" onClick={goContact}>¿Olvidaste tu contraseña?</button>
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

    </div>
  );
}

function ForgotPasswordScreen({
  email,
  setEmail,
  challenge,
  code,
  setCode,
  password,
  setPassword,
  passwordConfirmation,
  setPasswordConfirmation,
  onRequestCode,
  onResetPassword,
  onCancel,
  submitting,
  errorMessage,
  successMessage,
  completed
}) {
  const requestingCode = !challenge;
  const handleSubmit = (event) => {
    event.preventDefault();
    if (requestingCode) {
      onRequestCode();
    } else {
      onResetPassword();
    }
  };
  const passwordsMatch = password === passwordConfirmation;

  return (
    <div className="page">
      <div className="decoration top-left" />
      <div className="decoration bottom-right" />
      <main className="layout login-layout">
        <section className="presentation">
          <Logo />
          <h1>Recuperá el acceso<br /><strong>a tu cuenta</strong></h1>
          <p>Te ayudamos a cambiar tu contraseña de forma segura.</p>
        </section>
        <section className="card login-card">
          <h2>{requestingCode ? "Recuperar contraseña" : "Elegí una contraseña nueva"}</h2>
          <p className="card-description">
            {requestingCode
              ? "Ingresá el correo asociado a tu cuenta y te enviaremos un código."
              : "Ingresá el código que enviamos a tu correo y una contraseña nueva."}
          </p>
          {successMessage && <p className="success-message" role="status">{successMessage}</p>}
          {!completed && (
            <form onSubmit={handleSubmit}>
              {requestingCode ? (
              <Field
                icon="mail"
                name="email-recuperacion"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                maxLength={254}
                required
              />
              ) : (
                <>
                <Field
                  icon="lock"
                  name="codigo-recuperacion"
                  placeholder="Código de 6 dígitos"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                />
                <Field
                  icon="lock"
                  name="nueva-contrasena"
                  type="password"
                  placeholder="Nueva contraseña (12 a 72 caracteres)"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={72}
                  required
                />
                <PasswordRequirements password={password} />
                <Field
                  icon="lock"
                  name="confirmar-nueva-contrasena"
                  type="password"
                  placeholder="Confirmá la nueva contraseña"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={72}
                  required
                />
                {!passwordsMatch && passwordConfirmation && (
                  <p className="error-message" role="alert">Las contraseñas no coinciden.</p>
                )}
                </>
              )}
              {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
              <button
                className="primary-button"
                type="submit"
                disabled={submitting || (!requestingCode && (code.length !== 6 || !isStrongPassword(password) || !passwordsMatch))}
              >
                {submitting
                  ? (requestingCode ? "Enviando código..." : "Actualizando contraseña...")
                  : (requestingCode ? "Enviar código" : "Restablecer contraseña")}
              </button>
            </form>
          )}
          <button className="login-link" onClick={onCancel} type="button" disabled={submitting}>
            Volver al inicio de sesión
          </button>
        </section>
      </main>
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
          <h1 className="register-title">Juntos<br />construimos<br />un mejor vecindario</h1>
          <CommunityIllustration variant="register" />
        </section>

        <section className="card register-card">
          <h2>Crear cuenta</h2>
          <p className="card-description">Completá tus datos para unirte a la comunidad</p>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <Field icon="user" name="nombre" placeholder="Nombre (2 a 50 caracteres)" value={registerForm.nombre} onChange={handleChange} autoComplete="given-name" minLength={2} maxLength={50} required />
            <Field icon="user" name="apellido" placeholder="Apellido (2 a 50 caracteres)" value={registerForm.apellido} onChange={handleChange} autoComplete="family-name" minLength={2} maxLength={50} required />
            <Field icon="mail" name="email" placeholder="Correo electrónico" type="email" value={registerForm.email} onChange={handleChange} autoComplete="email" maxLength={254} required />
            <Field icon="lock" name="contrasena" type="password" placeholder="Contraseña segura (12 a 72 caracteres)" value={registerForm.contrasena} onChange={handleChange} autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} maxLength={72} required />
            <PasswordRequirements password={registerForm.contrasena} />

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

    </div>
  );
}

function getUserDisplayName(user) {
  if (!user) return "Mi cuenta";
  const nombre = String(user.nombre || user.name || "").trim();
  const apellido = String(user.apellido || user.lastName || "").trim();
  const email = user.email || user.correo;
  if (!nombre && !apellido && email) return String(email).split("@")[0];
  return `${nombre} ${apellido}`.trim() || "Mi cuenta";
}

function isAdministrator(user) {
  return String(user?.rol || "").trim().toLocaleLowerCase("es") === "administrador";
}

function isNeighbor(user) {
  return String(user?.rol || "").trim().toLocaleLowerCase("es") === "vecino";
}

function isMunicipalArea(user) {
  return String(user?.rol || "").trim().toLocaleLowerCase("es") === "area_municipal";
}

function getLandingScreen(user) {
  if (isAdministrator(user)) return "admin";
  if (isMunicipalArea(user)) return "municipal";
  return "home";
}

function AppLayout({ activeNav, navigateTo, children, user, onLogout, layoutClassName = "" }) {
  const nombreUsuario = getUserDisplayName(user);
  const isAdmin = isAdministrator(user);
  const isMunicipal = isMunicipalArea(user);

  return (
    <div className={`sac-app-container ${layoutClassName}`.trim()}>
      <header className="sac-navbar">
        <div className="sac-logo-area">
          <img src="/images/fabicon.jpeg" alt="Logo S.A.C." className="sac-nav-logo" />
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
            {isMunicipal ? (
              <button
                type="button"
                className={`sac-nav-item ${activeNav === "municipal" ? "active" : ""}`}
                onClick={() => navigateTo("municipal")}
              >
                <span className="sac-nav-icon"><Icon type="file" size={19} /></span>
                <span>Reportes municipales</span>
              </button>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </aside>

        <main className="sac-content-area">
          {children}
        </main>
      </div>

    </div>
  );
}

/* Pantalla 3: Dashboard Principal */
function Dashboard({ navigateTo, user, onLogout }) {
  const nombre = user?.nombre || "Vecino/a";

  return (
    <AppLayout activeNav="home" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <div className="sac-dashboard-header">
        <div>
          <h1 className="sac-welcome-title">¡Bienvenido/a, {nombre}!</h1>
          <p className="sac-welcome-subtitle">Juntos hacemos un vecindario mejor</p>
        </div>

        <div className="sac-city-info-card">
          <h3>Tu ciudad, más cuidada</h3>
          <p>Participá y ayudá a mejorar tu comunidad.</p>
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
          <h3>Problemas de la comunidad</h3>
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
  const [numeroCasa, setNumeroCasa] = useState("");
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

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setReportSaveError("La foto debe ser JPG, PNG, GIF o WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportSaveError("La foto no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setReportSaveError("");
    setFotoFile(file);
    setFotoNombre(file.name);

    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result);
    reader.onerror = () => setReportSaveError("No se pudo leer la foto seleccionada.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const direccionIngresada = ubicacion.trim();
    const alturaIngresada = numeroCasa.trim();
    const direccionCompleta = alturaIngresada
      ? `${direccionIngresada} ${alturaIngresada}`
      : direccionIngresada;
    const tieneCoordenadas = Boolean(coordenadas);
    if (
      !categoria ||
      descripcion.trim().length < 20 ||
      descripcion.trim().length > 1000 ||
      (direccionIngresada.length > 0 && (direccionIngresada.length < 3 || direccionCompleta.length > 150)) ||
      (!direccionIngresada && !tieneCoordenadas) ||
      (alturaIngresada.length > 20 ||
        (alturaIngresada && (!direccionIngresada || !/^[\p{L}\p{N}][\p{L}\p{N}\s/-]{0,19}$/u.test(alturaIngresada))))
    ) {
      setReportSaveError("Ingresá una descripción de 20–1000 caracteres y una dirección de al menos 3 caracteres o usá el GPS. Si agregás una altura, escribila junto a una dirección.");
      return;
    }
    setReportSaveError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("id_categoria", categoria);
    formData.append("titulo", descripcion.trim().replace(/\s+/g, " ").slice(0, 100));
    formData.append("descripcion", descripcion.trim());
    formData.append("direccion", direccionCompleta);
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
    <AppLayout activeNav="reportes" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Reportar un problema</h1>
      <p className="sac-page-subtitle">Completá la información para enviar tu reporte</p>

      <div className="sac-report-layout">
        <form className="sac-form-container" onSubmit={handleSubmit}>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="reporte-categoria">Categoría</label>
            <div className="sac-select-wrapper">
              <select id="reporte-categoria" className="sac-select" value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={loadingCategories} required>
                <option value="" disabled>{loadingCategories ? "Cargando categorías..." : "Elegí el tipo de problema"}</option>
                {categorias.map((item) => (
                  <option key={item.id_categoria} value={item.id_categoria}>{item.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sac-form-group">
            <label className="sac-label" htmlFor="reporte-descripcion">Descripción</label>
            <div className="sac-textarea-wrapper">
              <textarea
                id="reporte-descripcion"
                className="sac-textarea"
                placeholder="Contanos qué sucede..."
                minLength={20}
                maxLength={1000}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              ></textarea>
              <span className="sac-char-count">{descripcion.length}/1000 (mínimo 20)</span>
            </div>
          </div>

          <div className="sac-form-group">
            <label className="sac-label" htmlFor="reporte-ubicacion">Ubicación del problema</label>
            <input
              id="reporte-ubicacion"
              className="sac-input"
              type="text"
              placeholder="Ingresá calle, esquina o referencia"
              value={ubicacion}
              minLength={3}
              maxLength={130}
              onChange={(event) => {
                setUbicacion(event.target.value);
                setCoordenadas(null);
              }}
              required={!coordenadas}
            />
            <label className="sac-label" htmlFor="reporte-altura">Número de casa / altura (opcional)</label>
            <input
              id="reporte-altura"
              className="sac-input"
              type="text"
              placeholder="Ej.: 123 o 123 B"
              value={numeroCasa}
              maxLength={20}
              onChange={(event) => setNumeroCasa(event.target.value)}
            />
            <button className="sac-location-btn" onClick={handleGetLocation} type="button" disabled={loadingLocation}>
              <Icon type="pin" size={16} />
              {loadingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
            </button>
            <p className="sac-location-description">
              Indicá la calle y la altura para ubicar el domicilio con precisión, o usá el GPS como alternativa.
            </p>
            {coordenadas && (
              <p className="sac-location-coordinates">
                Se usarán las coordenadas del GPS si no ingresás una dirección.
              </p>
            )}
            {locationError && <p className="error-message" role="alert">{locationError}</p>}
          </div>

          {reportSaveError && <p className="error-message" role="alert">{reportSaveError}</p>}

          <div className="sac-form-group">
            <label className="sac-label">Agregar una foto (opcional)</label>
            <input id="reporte-foto" className="sac-file-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} />
            <label className="sac-upload-box" htmlFor="reporte-foto">
              <span className="sac-upload-icon"><Icon type="camera" size={22} /></span>
              <span className="sac-upload-copy">
                <strong>{fotoNombre || "Elegí una imagen"}</strong>
                <small>{fotoNombre ? "Seleccioná otro archivo para reemplazarla" : "JPG, PNG, GIF o WEBP · hasta 5 MB"}</small>
              </span>
              <span className="sac-upload-action">{fotoNombre ? "Cambiar" : "Buscar archivo"}</span>
              {fotoPreview && <img src={fotoPreview} alt="Vista previa" className="sac-upload-preview" />}
            </label>
          </div>

          <button className="sac-primary-btn" type="submit" disabled={submitting || loadingCategories}>
            {submitting ? "Enviando..." : "Enviar reporte"}
          </button>
        </form>

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
function MyReports({ navigateTo, user, onLogout, setSelectedReportId }) {
  const administratorView = isAdministrator(user);
  const [filter, setFilter] = useState("todos");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const endpoint = administratorView ? "/admin/reportes" : "/reportes/mis-reportes";
    apiFetch(endpoint, { cache: "no-store" })
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
  }, [reloadKey, administratorView]);

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

  const reloadReports = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} user={user} onLogout={onLogout} layoutClassName="sac-reports-app">
      <h1 className="sac-page-title">{administratorView ? "Reportes" : "Mis reportes"}</h1>
      <p className="sac-page-subtitle">
        {administratorView ? "Consultá todos los reportes registrados." : "Acá podés ver el estado de todos tus reportes"}
      </p>

      <div className="sac-filter-tabs">
        <button type="button" className={`sac-tab ${filter === "todos" ? "active" : ""}`} onClick={() => setFilter("todos")}>Todos</button>
        <button type="button" className={`sac-tab ${filter === "pendientes" ? "active" : ""}`} onClick={() => setFilter("pendientes")}>Pendientes</button>
        <button type="button" className={`sac-tab ${filter === "en-proceso" ? "active" : ""}`} onClick={() => setFilter("en-proceso")}>En proceso</button>
        <button type="button" className={`sac-tab ${filter === "resueltos" ? "active" : ""}`} onClick={() => setFilter("resueltos")}>Resueltos</button>
      </div>

      <div className="sac-reports-list">
        {loading && <p className="sac-admin-empty">{administratorView ? "Cargando reportes..." : "Cargando tus reportes..."}</p>}
        {error && (
          <div className="sac-admin-error" role="alert">
            <p className="error-message">{error}</p>
            <button type="button" className="sac-admin-retry-btn" onClick={reloadReports} disabled={loading}>
              {loading ? "Cargando..." : "Reintentar"}
            </button>
          </div>
        )}
        {!loading && !error && filteredReports.length === 0 && (
          <div className="sac-admin-empty">
            <p>
              {reports.length === 0
                ? (administratorView ? "Todavía no hay reportes registrados." : "Todavía no creaste reportes.")
                : "No hay reportes para mostrar en este filtro."}
            </p>
            <button type="button" className="sac-secondary-btn" onClick={reloadReports}>
              Actualizar lista
            </button>
            {reports.length === 0 && !administratorView && (
              <button type="button" className="sac-primary-btn" onClick={() => navigateTo("reportar-form")}>
                Crear un reporte
              </button>
            )}
          </div>
        )}
        {filteredReports.map((item) => (
          <div
            className="sac-report-card clickable"
            key={item.id_reporte}
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedReportId(item.id_reporte);
              navigateTo("detalle-reporte");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedReportId(item.id_reporte);
                navigateTo("detalle-reporte");
              }
            }}
          >
            <ReportPhoto className="sac-report-thumb" photo={item.foto} alt={`Foto del reporte ${item.titulo}`} />
            <div className="sac-report-info">
              <h3>{item.titulo}</h3>
              <p>
                {item.direccion || (item.latitud != null && item.longitud != null ? "Ubicación por GPS" : "Ubicación no informada")}
                {" • "}
                {item.fecha_reporte ? new Date(item.fecha_reporte).toLocaleDateString("es-AR") : ""}
              </p>
              {item.estado_revision === "pendiente" && (
                <span className="sac-report-review-status">
                  <span className="sac-report-review-icon"><Icon type="clock" size={16} /></span>
                  <span className="sac-report-review-copy">
                    <strong>Pendiente de revisión</strong>
                    <small>El equipo municipal revisará tu reporte antes de publicarlo.</small>
                  </span>
                </span>
              )}
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
function MapScreen({ navigateTo, user, onLogout, onOpenReport }) {
  const [searchText, setSearchText] = useState("Benito Juárez, Buenos Aires, Argentina");
  const [searchError, setSearchError] = useState("");
  const [mapLocation, setMapLocation] = useState("Benito Juárez, Buenos Aires, Argentina");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const mapCanvasRef = useRef(null);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=19&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`;

  useEffect(() => {
    let active = true;
    apiFetch("/reportes/todos", { cache: "no-store" })
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
    if (location.length < 3 || location.length > 150) {
      setSearchError("Ingresá una ubicación de entre 3 y 150 caracteres.");
      return;
    }
    setSearchError("");
    setMapLocation(location);
    setSelectedReportId(null);
  };

  const handleSelectReport = (report) => {
    const location = getReportLocation(report);
    setMapLocation(location.query);
    setSearchText(location.searchText);
    setSelectedReportId(report.id_reporte);
    onOpenReport(report.id_reporte);
    mapCanvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLocaleLowerCase("es");
    if (normalized.includes("resuelt") || normalized.includes("cerrad")) return "status-resolved";
    if (normalized.includes("proceso") || normalized.includes("curso")) return "status-in-process";
    return "status-pending";
  };

  return (
    <AppLayout activeNav="mapa" navigateTo={navigateTo} user={user} onLogout={onLogout}>
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
            onChange={(event) => {
              setSearchText(event.target.value);
              setSearchError("");
            }}
            placeholder="Ej.: Calle 12 y 5, localidad"
            aria-label="Buscar una dirección o localidad en el mapa"
            minLength={3}
            maxLength={150}
            required
          />
          <button className="sac-map-link sac-map-search-button" type="submit">Buscar en el mapa</button>
        </div>
        {searchError && <p className="error-message" role="alert">{searchError}</p>}
      </form>

      <div className="sac-map-canvas" ref={mapCanvasRef}>
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
            <h2 id="map-reports-title">Reportes de la comunidad</h2>
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
            <div
              className={`sac-map-report-item ${selectedReportId === report.id_reporte ? "selected" : ""}`}
              key={report.id_reporte}
            >
              <button
                className="sac-map-report-select"
                onClick={() => handleSelectReport(report)}
                type="button"
                aria-pressed={selectedReportId === report.id_reporte}
                aria-label={`Ubicar ${report.titulo} en el mapa`}
              >
                {report.foto
                  ? <ReportPhoto className="sac-map-report-photo" photo={report.foto} alt={`Foto del reporte ${report.titulo}`} />
                  : <span className="sac-map-report-pin"><Icon type="pin" size={19} /></span>}
                <span className="sac-map-report-details">
                  <strong>{report.titulo}</strong>
                  <span className="sac-map-report-location">
                    {report.direccion || (report.latitud != null && report.longitud != null ? "Ubicación por GPS" : "Ubicación no informada")}
                  </span>
                  <span className="sac-map-report-date">{report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : ""}</span>
                  <span className="sac-map-report-date">Seleccioná para ubicarlo en el mapa</span>
                </span>
                <span className={`sac-status-badge ${getStatusClass(report.estado)}`}>{report.estado}</span>
              </button>
              <button
                className="sac-map-report-detail-button"
                type="button"
                onClick={() => {
                  setSelectedReportId(report.id_reporte);
                  navigateTo("detalle-reporte");
                }}
              >
                Ver detalle
              </button>
              <a
                className="sac-map-report-detail-button"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getReportLocation(report).query)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                Abrir ubicación
              </a>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

/* Pantalla 7: Detalle del reporte */
function ReportDetail({ navigateTo, user, onLogout, reportId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [supporting, setSupporting] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch(`/reportes/${reportId}`)
      .then((response) => {
        if (!active) return;
        setReport(response.reporte);
        setLikes(Number(response.apoyos) || 0);
        setHasLiked(Boolean(response.apoyado));
      })
      .catch((requestError) => {
        console.error(`No se pudo cargar el reporte ${reportId}.`, requestError);
        if (active) setError(requestError.message || "No se pudo cargar el reporte.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reportId]);

  const handleSupport = async () => {
    setSupporting(true);
    setError("");
    try {
      const response = await apiFetch(`/reportes/${reportId}/apoyar`, { method: "POST" });
      setHasLiked(Boolean(response.apoyado));
      setLikes((current) => Math.max(0, current + (response.apoyado ? 1 : -1)));
    } catch (requestError) {
      console.error(`No se pudo actualizar el apoyo del reporte ${reportId}.`, requestError);
      setError(requestError.message || "No se pudo actualizar tu apoyo.");
    } finally {
      setSupporting(false);
    }
  };

  return (
    <AppLayout activeNav="reportes" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Detalle del reporte</h1>
      <p className="sac-page-subtitle">Información y seguimiento</p>

      {loading && <p className="sac-admin-empty">Cargando reporte...</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {!loading && !error && !report && <p className="sac-admin-empty">No se encontró el reporte.</p>}
      {report && (
        <div className="sac-detail-card">
          <ReportPhoto className="sac-detail-photo" photo={report.foto} alt={`Foto del reporte ${report.titulo}`} />
          <h2 className="sac-detail-title">{report.titulo}</h2>

          <div className="sac-detail-meta-bar">
            <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="pin" size={15} /></span><span>{report.direccion || "Ubicación no informada"}</span></div>
            <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="calendar" size={15} /></span><span>{report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : "Fecha no disponible"}</span></div>
            <div className="sac-meta-item"><span className="sac-meta-icon"><Icon type="heart" size={15} /></span><span>{likes} vecinos lo apoyaron</span></div>
          </div>

          <div className="sac-detail-status-wrapper"><span className="sac-status-badge">{report.estado || "Sin estado"}</span></div>

          <div className="sac-detail-description-box">
            <h3>Descripción</h3>
            <p>{report.descripcion || "Sin descripción."}</p>
            {report.categoria && <p><strong>Categoría:</strong> {report.categoria}</p>}
            {report.vecino && <p><strong>Reportado por:</strong> {report.vecino}</p>}
          </div>

          {isNeighbor(user) && (
            <button className={`sac-support-button ${hasLiked ? "supported" : ""}`} onClick={handleSupport} type="button" disabled={supporting}>
              <span className="sac-like-icon"><Icon type="like" size={18} /></span>
              <span>{supporting ? "Actualizando..." : hasLiked ? "Reporte apoyado" : "Apoyar reporte"}</span>
            </button>
          )}
        </div>
      )}
    </AppLayout>
  );
}

/* Pantalla 8: Notificaciones */
function NotificationsScreen({ navigateTo, user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    if (!window.isSecureContext) return "insecure";
    return Notification.permission;
  });
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch("/notificaciones")
      .then((response) => {
        if (active) setNotifications(response.notificaciones || []);
      })
      .catch((requestError) => {
        console.error("No se pudieron cargar las notificaciones.", requestError);
        if (active) setError(requestError.message || "No se pudieron cargar las notificaciones.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleMarkAsRead = async () => {
    setUpdating(true);
    setError("");
    try {
      await apiFetch("/notificaciones/leer", { method: "PUT" });
      setNotifications((current) => current.map((item) => ({ ...item, leida: true })));
    } catch (requestError) {
      console.error("No se pudieron marcar las notificaciones como leídas.", requestError);
      setError(requestError.message || "No se pudieron actualizar las notificaciones.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestNotificationPermission = async () => {
    setPermissionError("");
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
    } catch (requestError) {
      console.error("No se pudo solicitar el permiso de notificaciones.", requestError);
      setPermissionError("No se pudo solicitar el permiso. Revisá la configuración del navegador e intentá nuevamente.");
    }
  };

  const hasUnread = notifications.some((item) => !item.leida);

  return (
    <AppLayout activeNav="notificaciones" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Notificaciones</h1>
      <p className="sac-page-subtitle">Enterate de todas las novedades</p>

      <section className="sac-notifications-permission" aria-label="Permiso de notificaciones del navegador">
        <div>
          <h2>Avisos del navegador</h2>
          {browserPermission === "granted" && <p>El permiso está activado en este navegador.</p>}
          {browserPermission === "default" && <p>Permití los avisos para que el navegador pueda mostrarlos.</p>}
          {browserPermission === "denied" && <p>El permiso está bloqueado. Habilitalo desde la configuración del sitio en tu navegador.</p>}
          {browserPermission === "unsupported" && <p>Este navegador no permite mostrar avisos del sistema.</p>}
          {browserPermission === "insecure" && <p>Los avisos requieren una conexión segura (HTTPS) o abrir la app en localhost.</p>}
          {permissionError && <p className="sac-notifications-permission-error" role="alert">{permissionError}</p>}
        </div>
        {browserPermission === "default" && (
          <button
            className="sac-notifications-mark-read"
            type="button"
            onClick={handleRequestNotificationPermission}
          >
            Activar avisos
          </button>
        )}
      </section>

      {error && <p className="error-message" role="alert">{error}</p>}
      {!loading && !error && (
        <div className="sac-notifications-toolbar">
          <p>
            {notifications.length} {notifications.length === 1 ? "notificación" : "notificaciones"}
          </p>
          {hasUnread && (
            <button
              className="sac-notifications-mark-read"
              type="button"
              onClick={handleMarkAsRead}
              disabled={updating}
            >
              {updating ? "Actualizando..." : "Marcar todas como leídas"}
            </button>
          )}
        </div>
      )}
      <div className="sac-notifications-list">
        {loading && <p className="sac-admin-empty">Cargando notificaciones...</p>}
        {!loading && !error && notifications.length === 0 && (
          <p className="sac-admin-empty sac-notifications-empty">Todavía no tenés notificaciones.</p>
        )}
        {notifications.map((item) => {
          const date = item.fecha_notificacion ? new Date(item.fecha_notificacion) : null;
          return (
            <div className={`sac-notification-card ${item.leida ? "" : "unread"}`} key={item.id_notificacion}>
              <div className="sac-notification-icon-wrapper">
                <Icon type={item.tipo === "estado" ? "clipboard" : "bell"} size={20} />
              </div>
              <div className="sac-notification-content">
                <div className="sac-notification-heading">
                  <h3>{item.tipo === "estado" ? "Actualización de tu reporte" : "Notificación"}</h3>
                  {!item.leida && <span className="sac-notification-new">Nueva</span>}
                </div>
                <p>{item.mensaje}</p>
                <time className="sac-notification-time" dateTime={date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined}>
                  {date && !Number.isNaN(date.getTime()) ? date.toLocaleString("es-AR") : ""}
                </time>
              </div>
            </div>
          );
        })}
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
    <AppLayout activeNav="guia" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <div className="sac-guide-page-heading">
        <span className="sac-guide-eyebrow">CENTRO DE AYUDA</span>
        <h1 className="sac-page-title">Guía de uso</h1>
        <p className="sac-page-subtitle">Una guía simple para reportar y hacer seguimiento de problemas en la vía pública.</p>
      </div>

      <div className="sac-guide-hero">
        <div className="sac-guide-hero-copy">
          <span className="sac-guide-hero-icon"><Icon type="book" size={25} /></span>
          <div>
            <span className="sac-guide-hero-label">S.A.C. · Sistema de Atención Ciudadana</span>
          <h2>¿Cómo funciona el S.A.C.?</h2>
          <p>Esta plataforma te permite reportar incidencias en la vía pública de forma simple, ordenada y visible para la comunidad.</p>
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

    </AppLayout>
  );
}

/* Pantalla 11: Perfil */
function ProfileScreen({ navigateTo, user, setUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const startEditing = () => {
    setProfileDraft({
      nombre: user?.nombre || "",
      apellido: user?.apellido || "",
      email: user?.email || "",
      foto: user?.foto || null,
      fotoFile: null
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    const updated = {
      ...user,
      nombre: profileDraft.nombre.trim(),
      apellido: profileDraft.apellido.trim(),
      email: profileDraft.email.trim(),
      foto: profileDraft.foto
    };

    if (updated.nombre.length < 2 || updated.nombre.length > 50) {
      setProfileError("El nombre debe tener entre 2 y 50 caracteres.");
      return;
    }
    if (updated.apellido.length < 2 || updated.apellido.length > 50) {
      setProfileError("El apellido debe tener entre 2 y 50 caracteres.");
      return;
    }
    if (updated.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) {
      setProfileError("Ingresá un correo válido de hasta 254 caracteres.");
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("nombre", updated.nombre);
      formData.append("apellido", updated.apellido);
      formData.append("email", updated.email);
      if (profileDraft.fotoFile) formData.append("foto", profileDraft.fotoFile);

      const response = await apiFetch("/perfil/editar", {
        method: "PUT",
        body: formData
      });
      if (!response.usuario) {
        throw new Error("El servidor no devolvió el perfil actualizado.");
      }
      const persistedUser = { ...updated, ...response.usuario };
      setUser(persistedUser);
      getSessionStorage().setItem("sac_user", JSON.stringify(persistedUser));
      setIsEditing(false);
      setSuccessMsg("¡Perfil actualizado con éxito!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("No se pudo actualizar el perfil.", error);
      setProfileError(error.message || "No se pudieron guardar los cambios. Intentá nuevamente.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setProfileError("La foto debe ser JPG, PNG, GIF o WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("La foto no puede superar los 5 MB.");
      e.target.value = "";
      return;
    }

    setProfileError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileDraft((current) => ({ ...current, foto: reader.result, fotoFile: file }));
    };
    reader.onerror = () => setProfileError("No se pudo leer la foto seleccionada.");
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Perfil</h1>
      <p className="sac-page-subtitle">Administrá tu información y preferencias</p>

      {successMsg && <p className="success-message">{successMsg}</p>}
      {profileError && <p className="error-message" role="alert">{profileError}</p>}

      {!isEditing ? (
        <>
          <div className="sac-profile-card-header">
            <div className="sac-profile-avatar-large">
              {user?.foto ? <img src={user.foto} alt="Avatar" className="sac-avatar-img" /> : <span><Icon type="user" size={26} /></span>}
            </div>
            <div>
              <h2>{user?.nombre} {user?.apellido}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="sac-profile-menu-list">
            <button className="sac-profile-menu-item" onClick={startEditing} type="button">
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
            <button className="sac-profile-menu-item" onClick={() => navigateTo("contacto")} type="button">
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
            <input id="perfil-foto" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} className="sac-file-input" />
            <label className="sac-profile-upload" htmlFor="perfil-foto">
              <span className="sac-profile-upload-preview">
                {profileDraft.foto ? <img src={profileDraft.foto} alt="" /> : <Icon type="user" size={22} />}
              </span>
              <span className="sac-upload-copy">
                <strong>{profileDraft.foto ? "Foto seleccionada" : "Agregá una foto de perfil"}</strong>
                <small>Elegí una imagen desde tu dispositivo</small>
              </span>
              <span className="sac-upload-action">{profileDraft.foto ? "Cambiar" : "Elegir foto"}</span>
            </label>
          </div>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="perfil-nombre">Nombre</label>
            <input id="perfil-nombre" type="text" className="sac-input" value={profileDraft.nombre} onChange={(e) => setProfileDraft((current) => ({ ...current, nombre: e.target.value }))} minLength={2} maxLength={50} required />
          </div>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="perfil-apellido">Apellido</label>
            <input id="perfil-apellido" type="text" className="sac-input" value={profileDraft.apellido} onChange={(e) => setProfileDraft((current) => ({ ...current, apellido: e.target.value }))} minLength={2} maxLength={50} required />
          </div>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="perfil-email">Correo electrónico</label>
            <input id="perfil-email" type="email" className="sac-input" value={profileDraft.email} onChange={(e) => setProfileDraft((current) => ({ ...current, email: e.target.value }))} maxLength={254} required />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="sac-primary-btn" type="submit" disabled={savingProfile}>
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
            <button className="sac-secondary-btn" type="button" onClick={() => { setIsEditing(false); setProfileDraft(null); }} disabled={savingProfile}>Cancelar</button>
          </div>
        </form>
      )}
    </AppLayout>
  );
}

function ContactScreen({ navigateTo, user, onLogout }) {
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const asuntoLimpio = asunto.trim();
    const mensajeLimpio = mensaje.trim();
    if (asuntoLimpio.length < 5 || asuntoLimpio.length > 100) {
      setError("El asunto debe tener entre 5 y 100 caracteres.");
      return;
    }
    if (mensajeLimpio.length < 20 || mensajeLimpio.length > 1000) {
      setError("El mensaje debe tener entre 20 y 1000 caracteres.");
      return;
    }
    setSubmitting(true);

    try {
      const response = await apiFetch("/contacto", {
        method: "POST",
        body: JSON.stringify({ asunto: asuntoLimpio, mensaje: mensajeLimpio })
      });
      setSuccess(response.mensaje || "Tu consulta fue enviada correctamente.");
      setAsunto("");
      setMensaje("");
    } catch (requestError) {
      console.error("No se pudo enviar la consulta de contacto.", requestError);
      setError(requestError.message || "No se pudo enviar tu consulta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Contacto y ayuda</h1>
      <p className="sac-page-subtitle">Enviá una consulta al equipo de atención ciudadana.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      {success && <p className="success-message" role="status">{success}</p>}
      <form className="sac-form-container sac-contact-form" onSubmit={handleSubmit}>
        <p>Tu consulta quedará asociada a la cuenta {user?.email}.</p>
        <div className="sac-form-group">
          <label className="sac-label" htmlFor="contacto-asunto">Asunto</label>
          <input
            id="contacto-asunto"
            className="sac-input"
            value={asunto}
            onChange={(event) => setAsunto(event.target.value)}
            minLength={5}
            maxLength={100}
            required
          />
          <span className="sac-char-count">{asunto.length}/100 (mínimo 5)</span>
        </div>
        <div className="sac-form-group">
          <label className="sac-label" htmlFor="contacto-mensaje">Mensaje</label>
          <textarea
            id="contacto-mensaje"
            className="sac-textarea"
            value={mensaje}
            onChange={(event) => setMensaje(event.target.value)}
            minLength={20}
            maxLength={1000}
            required
          />
          <span className="sac-char-count">{mensaje.length}/1000 (mínimo 20)</span>
        </div>
        <button className="sac-primary-btn" type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar consulta"}
        </button>
        <button className="sac-secondary-btn" type="button" onClick={() => navigateTo("perfil")}>
          Volver al perfil
        </button>
      </form>
      <a
        className="sac-contact-card sac-contact-info-link"
        href="https://www.bing.com/maps/default.aspx?v=2&pc=FACEBK&mid=8100&where1=-37.675193%2C%20-59.804592&FORM=FBKPL1&name=Av.%20Mitre%20N%C2%B042%2C%20Benito%20Ju%C3%A1rez%2C%20Argentina%2C%207020"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sac-contact-icon-wrapper"><Icon type="pin" size={21} /></span>
        <span>
          <strong>Dirección del Municipio</strong>
          <span>Av. Mitre N° 42, Benito Juárez, Argentina, 7020 · Ver en el mapa</span>
        </span>
      </a>
      <a className="sac-contact-card sac-contact-info-link" href="tel:+542292451400">
        <span className="sac-contact-icon-wrapper"><Icon type="phone" size={20} /></span>
        <span>
          <strong>Teléfono del Municipio</strong>
          <span>02292 45-1400 · Llamar</span>
        </span>
      </a>
      <section className="sac-contact-social" aria-labelledby="contacto-redes-titulo">
        <h2 className="sac-social-title" id="contacto-redes-titulo">Contactanos</h2>
        <p className="sac-contact-social-description">
          Escribinos por correo, seguinos en redes o visitá el sitio oficial del Municipio.
        </p>
        <div className="sac-social-links-row">
          <a
            className="sac-social-item"
            href="mailto:municipalidadbenitojuarez@gmail.com"
          >
            <svg className="sac-social-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#c2410c" strokeWidth="1.8" />
              <path d="m4 7 8 6 8-6" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Correo electrónico
          </a>
          <a
            className="sac-social-item"
            href="https://www.facebook.com/profile.php?id=100064402131639"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="sac-social-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#0866ff" />
              <path
                fill="#fff"
                d="M13.45 21v-8.2h2.76l.41-3.2h-3.17V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14c-.3-.04-1.34-.14-2.55-.14-2.53 0-4.26 1.54-4.26 4.37V9.6H7.07v3.2h2.86V21h3.52Z"
              />
            </svg>
            Facebook
          </a>
          <a
            className="sac-social-item"
            href="https://www.instagram.com/municipiobenitojuarez/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="sac-social-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="instagram-brand-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#feda75" />
                  <stop offset=".35" stopColor="#fa7e1e" />
                  <stop offset=".65" stopColor="#d62976" />
                  <stop offset="1" stopColor="#4f5bd5" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#instagram-brand-gradient)" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="url(#instagram-brand-gradient)" strokeWidth="2" />
              <circle cx="17.5" cy="6.8" r="1.2" fill="#d62976" />
            </svg>
            Instagram
          </a>
          <a
            className="sac-social-item"
            href="https://benitojuarez.gov.ar/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="sac-social-brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#c2410c" strokeWidth="1.8" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#c2410c" strokeWidth="1.5" />
            </svg>
            Sitio oficial
          </a>
        </div>
      </section>
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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (nueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (!isStrongPassword(nueva)) {
      setError("La nueva contraseña debe cumplir todos los requisitos indicados.");
      return;
    }

    if (nueva === actual) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch("/perfil/contrasena", {
        method: "PUT",
        body: JSON.stringify({
          contrasenaActual: actual,
          contrasenaNueva: nueva
        })
      });
      setMsg(response.mensaje || "¡Contraseña actualizada correctamente!");
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (requestError) {
      console.error("No se pudo actualizar la contraseña.", requestError);
      setError(requestError.message || "No se pudo actualizar la contraseña. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeNav="perfil" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <h1 className="sac-page-title">Cambiar contraseña</h1>
      <p className="sac-page-subtitle">Por tu seguridad, te recomendamos usar una contraseña fuerte.</p>

      <div className="sac-detail-card">
        <form className="sac-password-form" onSubmit={handleSubmit}>
          <div className="sac-form-group">
            <label className="sac-label" htmlFor="password-actual">Contraseña actual</label>
            <input
              id="password-actual"
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              maxLength={72}
              required
            />
          </div>

          <div className="sac-form-group">
            <label className="sac-label" htmlFor="password-nueva">Nueva contraseña</label>
            <input
              id="password-nueva"
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={72}
              required
            />
            <PasswordRequirements password={nueva} />
          </div>

          <div className="sac-form-group">
            <label className="sac-label" htmlFor="password-confirmar">Confirmar nueva contraseña</label>
            <input
              id="password-confirmar"
              type="password"
              className="sac-input"
              placeholder="Contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={72}
              required
            />
            {confirmar && nueva !== confirmar && (
              <p className="error-message" role="alert">Las contraseñas nuevas no coinciden.</p>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}
          {msg && <p className="success-message">{msg}</p>}

          <button className="sac-primary-btn" type="submit" style={{ marginTop: "15px" }} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

function AdminScreen({ navigateTo, user, onLogout }) {
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [updatingUserRoleId, setUpdatingUserRoleId] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      setError("");

      const results = await Promise.allSettled([
        apiFetch("/admin/reportes"),
        apiFetch("/admin/usuarios"),
        apiFetch("/admin/estados"),
        apiFetch("/admin/contacto")
      ]);
      if (!active) return;

      const failures = [];
      const [reportsResult, usersResult, statesResult, contactsResult] = results;
      if (reportsResult.status === "fulfilled") {
        setReportes(reportsResult.value.reportes || []);
      } else {
        console.error("No se pudieron cargar los reportes administrativos.", reportsResult.reason);
        failures.push(`Reportes: ${reportsResult.reason.message || "no disponibles"}`);
      }
      if (usersResult.status === "fulfilled") {
        setUsuarios(usersResult.value.usuarios || []);
      } else {
        console.error("No se pudieron cargar los usuarios administrativos.", usersResult.reason);
        failures.push(`Usuarios: ${usersResult.reason.message || "no disponibles"}`);
      }
      if (statesResult.status === "fulfilled") {
        setEstados(statesResult.value.estados || []);
      } else {
        console.error("No se pudieron cargar los estados administrativos.", statesResult.reason);
        failures.push(`Estados: ${statesResult.reason.message || "no disponibles"}`);
      }
      if (contactsResult.status === "fulfilled") {
        setConsultas(contactsResult.value.consultas || []);
      } else {
        console.error("No se pudieron cargar las consultas de contacto.", contactsResult.reason);
        failures.push(`Contacto: ${contactsResult.reason.message || "no disponible"}`);
      }

      if (failures.length) setError(`No se pudieron cargar todos los datos. ${failures.join(". ")}`);
      setLoading(false);
    };

    loadAdminData();
    return () => {
      active = false;
    };
  }, [reloadKey]);

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
    if (!window.confirm(`¿Eliminar el reporte “${report.titulo}” y sus apoyos? Esta acción no se puede deshacer.`)) return;

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
    if (!window.confirm(`¿Eliminar a ${userName}, todos sus reportes y apoyos? Esta acción no se puede deshacer.`)) return;

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

  const handleUserRoleChange = async (registeredUser, rol) => {
    if (
      rol === "administrador"
      && registeredUser.rol !== "administrador"
      && !window.confirm(`¿Dar permisos de administrador a ${registeredUser.nombre || registeredUser.email}?`)
    ) {
      return;
    }

    setError("");
    setUpdatingUserRoleId(registeredUser.id_usuario);
    try {
      await apiFetch(`/admin/usuarios/${registeredUser.id_usuario}/rol`, {
        method: "PUT",
        body: JSON.stringify({ rol })
      });
      setUsuarios((current) => current.map((item) => (
        item.id_usuario === registeredUser.id_usuario ? { ...item, rol } : item
      )));
    } catch (requestError) {
      console.error(`No se pudo cambiar el rol del usuario ${registeredUser.id_usuario}.`, requestError);
      setError(requestError.message || "No se pudo cambiar el rol del usuario.");
    } finally {
      setUpdatingUserRoleId(null);
    }
  };

  return (
    <AppLayout activeNav="admin" navigateTo={navigateTo} user={user} onLogout={onLogout}>
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

      {error && (
        <div className="sac-admin-error" role="alert">
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="sac-admin-retry-btn"
            onClick={() => { setLoading(true); setReloadKey((key) => key + 1); }}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Reintentar"}
          </button>
        </div>
      )}

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
                <div className="sac-admin-report-summary">
                  <ReportPhoto className="sac-admin-report-photo" photo={report.foto} alt={`Foto del reporte ${report.titulo}`} />
                  <div className="sac-admin-report-copy">
                    <strong>#{report.id_reporte} · {report.titulo}</strong>
                    <span>{report.direccion || "Ubicación no informada"} · {report.vecino || "Vecino"}</span>
                    <span>{report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : "Fecha no disponible"}</span>
                    {report.descripcion && <span>{report.descripcion}</span>}
                    <span className={`sac-review-status ${report.estado_revision}`}>
                      Revisión: {report.estado_revision === "aprobado" ? "Aprobado" : report.estado_revision === "rechazado" ? "Rechazado" : "Pendiente"}
                    </span>
                  </div>
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

          <div className="sac-admin-section">
            <div className="sac-admin-section-header">
              <div>
                <h2>Consultas de contacto</h2>
                <p>Mensajes recibidos de vecinos</p>
              </div>
              <span className="sac-map-reports-count">{loading ? "Cargando..." : `${consultas.length} consultas`}</span>
            </div>
            <div className="sac-admin-list">
              {!loading && consultas.length === 0 && (
                <p className="sac-admin-empty">No hay consultas de contacto.</p>
              )}
              {consultas.map((consulta) => (
                <article className="sac-admin-contact-row" key={consulta.id_contacto}>
                  <div>
                    <strong>{consulta.asunto}</strong>
                    <p>{consulta.mensaje}</p>
                    <span>{consulta.usuario} · {consulta.email}</span>
                  </div>
                  <time>{consulta.fecha_contacto ? new Date(consulta.fecha_contacto).toLocaleString("es-AR") : ""}</time>
                </article>
              ))}
            </div>
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
              <label className="sac-admin-role-control">
                <span className="sac-sr-only">Rol de {registeredUser.nombre || registeredUser.email}</span>
                <select
                  className="sac-admin-role-select"
                  value={registeredUser.rol}
                  onChange={(event) => handleUserRoleChange(registeredUser, event.target.value)}
                  disabled={
                    Boolean(deletingRecord)
                    || updatingUserRoleId !== null
                    || String(registeredUser.id_usuario) === String(user?.id_usuario)
                  }
                  title={String(registeredUser.id_usuario) === String(user?.id_usuario) ? "No podés cambiar tu propio rol" : "Cambiar rol del usuario"}
                >
                  <option value="vecino">Vecino</option>
                  <option value="administrador">Administrador</option>
                  <option value="area_municipal">Área municipal</option>
                </select>
                {updatingUserRoleId === registeredUser.id_usuario && <span className="sac-role-saving">Guardando...</span>}
              </label>
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

function MunicipalScreen({ navigateTo, user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadMunicipalData = async () => {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        apiFetch("/municipal/reportes"),
        apiFetch("/municipal/estados")
      ]);
      if (!active) return;

      const [reportsResult, statesResult] = results;
      const errors = [];
      if (reportsResult.status === "fulfilled") {
        setReports(reportsResult.value.reportes || []);
      } else {
        console.error("No se pudieron cargar los reportes municipales.", reportsResult.reason);
        errors.push(reportsResult.reason.message || "No se pudieron cargar los reportes");
      }
      if (statesResult.status === "fulfilled") {
        setStates(statesResult.value.estados || []);
      } else {
        console.error("No se pudieron cargar los estados municipales.", statesResult.reason);
        errors.push(statesResult.reason.message || "No se pudieron cargar los estados");
      }
      if (errors.length) setError(errors.join(". "));
      setLoading(false);
    };

    loadMunicipalData();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredReports = reports.filter((report) =>
    `${report.id_reporte} ${report.titulo} ${report.direccion} ${report.vecino} ${report.estado}`
      .toLocaleLowerCase("es")
      .includes(search.toLocaleLowerCase("es"))
  );

  const handleStatusChange = async (reportId, estadoId) => {
    setError("");
    setUpdatingReportId(reportId);
    try {
      await apiFetch(`/municipal/reportes/${reportId}/estado`, {
        method: "PUT",
        body: JSON.stringify({ id_estado: Number(estadoId) })
      });
      const selectedState = states.find((state) => String(state.id_estado) === String(estadoId));
      if (selectedState) {
        setReports((current) => current.map((report) =>
          report.id_reporte === reportId ? { ...report, estado: selectedState.nombre, id_estado: selectedState.id_estado } : report
        ));
      }
    } catch (requestError) {
      console.error(`No se pudo actualizar el estado del reporte municipal ${reportId}.`, requestError);
      setError(requestError.message || "No se pudo actualizar el estado del reporte.");
    } finally {
      setUpdatingReportId(null);
    }
  };

  return (
    <AppLayout activeNav="municipal" navigateTo={navigateTo} user={user} onLogout={onLogout}>
      <div className="sac-admin-section">
        <div className="sac-admin-header">
          <div>
            <span className="sac-admin-eyebrow">Área municipal</span>
            <h1 className="sac-page-title">Seguimiento de reportes</h1>
          </div>
          <div className="sac-admin-role"><Icon type="clipboard" size={15} /> Solo consulta y estados</div>
        </div>
      </div>

      {error && (
        <div className="sac-admin-error" role="alert">
          <p className="error-message">{error}</p>
          <button
            type="button"
            className="sac-admin-retry-btn"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Reintentar"}
          </button>
        </div>
      )}

      <div className="sac-admin-section">
        <div className="sac-admin-section-header">
          <div>
            <h2>Reportes</h2>
            <p>Consultá los reportes y actualizá únicamente su estado.</p>
          </div>
          <label className="sac-admin-search">
            <Icon type="map" size={14} />
            <input
              type="search"
              placeholder="Buscar reporte"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="sac-admin-list">
          {loading && <p className="sac-admin-empty">Cargando reportes...</p>}
          {!loading && filteredReports.length === 0 && (
            <p className="sac-admin-empty">No hay reportes que coincidan con la búsqueda.</p>
          )}
          {filteredReports.map((report) => (
            <div className="sac-admin-row" key={report.id_reporte}>
              <div className="sac-admin-report-summary">
                <ReportPhoto className="sac-admin-report-photo" photo={report.foto} alt={`Foto del reporte ${report.titulo}`} />
                <div className="sac-admin-report-copy">
                  <strong>#{report.id_reporte} · {report.titulo}</strong>
                  <span>{report.categoria} · {report.direccion || "Ubicación no informada"}</span>
                  <span>{report.vecino || "Vecino"} · {report.fecha_reporte ? new Date(report.fecha_reporte).toLocaleDateString("es-AR") : "Fecha no disponible"}</span>
                  {report.descripcion && <span>{report.descripcion}</span>}
                </div>
              </div>
              <div className="sac-admin-control">
                <select
                  className="sac-select"
                  value={report.id_estado || ""}
                  onChange={(event) => handleStatusChange(report.id_reporte, event.target.value)}
                  disabled={updatingReportId === report.id_reporte || states.length === 0}
                  aria-label={`Cambiar estado del reporte ${report.id_reporte}`}
                >
                  {states.map((state) => (
                    <option key={state.id_estado} value={state.id_estado}>{state.nombre}</option>
                  ))}
                </select>
              </div>
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
  const [screen, setScreen] = useState(initialSession ? getLandingScreen(initialSession.user) : "login");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [user, setUser] = useState(initialSession?.user || {});
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryChallenge, setRecoveryChallenge] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPasswordConfirmation, setRecoveryPasswordConfirmation] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState("");
  const [recoveryCompleted, setRecoveryCompleted] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(initialSession?.expiresAt || null);
  const [rememberMe, setRememberMe] = useState(initialSession?.remember || false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
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
        if (active && response.usuario) {
          setUser(response.usuario);
          setScreen(getLandingScreen(response.usuario));
        }
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
      const storage = getSessionStorage();
      storage.setItem("sac_user", JSON.stringify(user));
      storage.setItem("sac_session_expires_at", String(sessionExpiresAt));
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

      clearStoredSession();
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("sac_token", response.token);
      setUser(response.usuario);
      setSessionExpiresAt(Date.now() + SESSION_DURATION_MS);
      setScreen(getLandingScreen(response.usuario));
    } catch (error) {
      console.error("No se pudo iniciar sesión.", error);
      setErrorMessage(error.message || "No se pudo iniciar sesión. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecoveryRequest = async () => {
    const email = recoveryEmail.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Ingresá un correo electrónico válido.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setRecoverySuccess("");
    try {
      const response = await apiFetch("/auth/solicitar-recuperacion", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      if (!response.desafio) {
        throw new Error("No se pudo iniciar la recuperación de contraseña.");
      }
      setRecoveryEmail(email);
      setRecoveryChallenge(response.desafio);
      setRecoveryCode("");
      setRecoveryPassword("");
      setRecoveryPasswordConfirmation("");
      setRecoverySuccess(response.mensaje || "Si el correo está registrado, recibirás un código.");
      setRecoveryCompleted(false);
    } catch (error) {
      console.error("No se pudo solicitar la recuperación de contraseña.", error);
      setErrorMessage(error.message || "No se pudo enviar el código. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!/^\d{6}$/.test(recoveryCode)) {
      setErrorMessage("Ingresá el código de seis dígitos.");
      return;
    }
    if (!isStrongPassword(recoveryPassword)) {
      setErrorMessage("La nueva contraseña debe cumplir todos los requisitos indicados.");
      return;
    }
    if (recoveryPassword !== recoveryPasswordConfirmation) {
      setErrorMessage("Las contraseñas nuevas no coinciden.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setRecoverySuccess("");
    try {
      const response = await apiFetch("/auth/restablecer-contrasena", {
        method: "POST",
        body: JSON.stringify({
          desafio: recoveryChallenge,
          codigo: recoveryCode,
          contrasena: recoveryPassword
        })
      });
      setRecoverySuccess(response.mensaje || "Contraseña actualizada. Ya podés iniciar sesión.");
      setRecoveryCompleted(true);
      setLoginForm((previous) => ({ ...previous, email: recoveryEmail, password: "" }));
    } catch (error) {
      console.error("No se pudo restablecer la contraseña.", error);
      setErrorMessage(error.message || "No se pudo actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async () => {
    const nombre = registerForm.nombre.trim();
    const apellido = registerForm.apellido.trim();
    const email = registerForm.email.trim();
    if (nombre.length < 2 || nombre.length > 50) {
      setErrorMessage("El nombre debe tener entre 2 y 50 caracteres.");
      return;
    }
    if (apellido.length < 2 || apellido.length > 50) {
      setErrorMessage("El apellido debe tener entre 2 y 50 caracteres.");
      return;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Ingresá un correo válido de hasta 254 caracteres.");
      return;
    }
    if (!isStrongPassword(registerForm.contrasena)) {
      setErrorMessage("La contraseña debe cumplir todos los requisitos indicados.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          contrasena: registerForm.contrasena
        })
      });
      setSuccessMessage(response.mensaje || "¡Cuenta creada con éxito!");
      setLoginForm((previous) => ({ ...previous, email, password: "" }));
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
    setUser({});
    setSessionExpiresAt(null);
    setLoginForm((previous) => ({ ...previous, password: "" }));
    setErrorMessage("");
    setScreen("login");
  };

  if (screen === "forgot-password") {
    return (
      <ForgotPasswordScreen
        email={recoveryEmail}
        setEmail={setRecoveryEmail}
        challenge={recoveryChallenge}
        code={recoveryCode}
        setCode={setRecoveryCode}
        password={recoveryPassword}
        setPassword={setRecoveryPassword}
        passwordConfirmation={recoveryPasswordConfirmation}
        setPasswordConfirmation={setRecoveryPasswordConfirmation}
        onRequestCode={handleRecoveryRequest}
        onResetPassword={handlePasswordReset}
        onCancel={() => {
          setRecoveryChallenge("");
          setRecoveryCode("");
          setRecoveryPassword("");
          setRecoveryPasswordConfirmation("");
          setErrorMessage("");
          setRecoverySuccess("");
          setRecoveryCompleted(false);
          setScreen("login");
        }}
        submitting={submitting}
        errorMessage={errorMessage}
        successMessage={recoverySuccess}
        completed={recoveryCompleted}
      />
    );
  }

  if (screen === "login") {
    return (
      <Login
        goRegister={() => { setScreen("register"); setErrorMessage(""); }}
        goContact={() => {
          setRecoveryEmail(loginForm.email);
          setRecoveryChallenge("");
          setRecoveryCode("");
          setRecoveryPassword("");
          setRecoverySuccess("");
          setRecoveryCompleted(false);
          setErrorMessage("");
          setScreen("forgot-password");
        }}
        onSubmit={handleLoginSubmit}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
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

  if (isMunicipalArea(user)) {
    return <MunicipalScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  }

  if (screen === "home") return <Dashboard navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "reportar-form") return <ReportForm navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "mis-reportes") return <MyReports navigateTo={setScreen} user={user} onLogout={handleLogout} setSelectedReportId={setSelectedReportId} />;
  if (screen === "mapa") return <MapScreen navigateTo={setScreen} user={user} onLogout={handleLogout} onOpenReport={setSelectedReportId} />;
  if (screen === "detalle-reporte") {
    if (selectedReportId) {
      return <ReportDetail key={selectedReportId} navigateTo={setScreen} user={user} onLogout={handleLogout} reportId={selectedReportId} />;
    }
    return <MyReports navigateTo={setScreen} user={user} onLogout={handleLogout} setSelectedReportId={setSelectedReportId} />;
  }
  if (screen === "notificaciones") return <NotificationsScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "guia-uso") return <GuiaUsoScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
  if (screen === "perfil") return <ProfileScreen navigateTo={setScreen} user={user} setUser={setUser} onLogout={handleLogout} />;
  if (screen === "contacto") return <ContactScreen navigateTo={setScreen} user={user} onLogout={handleLogout} />;
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
      goContact={() => setScreen("forgot-password")}
      onSubmit={handleLoginSubmit}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      rememberMe={rememberMe}
      setRememberMe={setRememberMe}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
}