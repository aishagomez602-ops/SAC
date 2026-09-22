import { useState } from "react";
import "./App.css";

function Logo() {
  return (
    <div className="logo">
        <img src="/images/fabicon.jpeg" alt=""/>
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

      <Logo />

      <div className="register-container">
        <h2>Crear una cuenta</h2>

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

        <div className="logo">
          <img src="/images/fabicon.jpeg" alt=""/>
        </div>

        <button className="profile-button">♙</button>
      </header>

      <main className="home-content">

        <h2>¡Bienvenido/a, Aisha!</h2>
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
            <span>🗺</span>
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
        <button>▣<small>Reportes</small></button>
        <button>🗺<small>Mapa</small></button>
        <button>♧<small>Notificaciones</small></button>
        <button>♙<small>Perfil</small></button>
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