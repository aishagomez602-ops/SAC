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
          Juntos hacemos un barrio mejor
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
    <div className="brand">
      <div className="logo-img">
        <img src="/images/fabicon,fondo.jpeg" alt=""/>
      </div>
    </div>
  );
}

function CityIllustration() {
  return (
   <p>messi</p>

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

function Login({ goRegister }) {
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

          <form onSubmit={(e) => e.preventDefault()}>
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

          <form onSubmit={(e) => e.preventDefault()}>
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

export default function App() {
  const [screen, setScreen] = useState("login");

  return screen === "login"
    ? <Login goRegister={() => setScreen("register")} />
    : <Register goLogin={() => setScreen("login")} />;
}
