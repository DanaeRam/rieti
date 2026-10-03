"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(event) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo_institucional: correo,
            password: contrasena,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.message || "No se pudo iniciar sesión");
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(datos.usuario)
      );

      window.location.href = "/admin/dashboard";
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="loginPage">
      <div className="loginContainer">

        <section className="loginFormSection">

          <Link href="/" className="loginBack">
            ← Volver a RIETI
          </Link>

          <div className="loginContent">

            <div className="loginHeader">
              <h1>Acceso Admin</h1>

              <p>
                Ingreso a la plataforma administrativa de RIETI.
              </p>
            </div>

            <div className="loginNotice">
              <strong>Acceso restringido</strong>

              <p>
                Este acceso está destinado únicamente a administradores
                y procuradores de RIETI.
              </p>
            </div>

            <form onSubmit={iniciarSesion}>

              <div className="loginField">
                <label htmlFor="correo">
                  Correo institucional
                </label>

                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@dominio.gob.mx"
                  required
                />
              </div>

              <div className="loginField">
                <label htmlFor="contrasena">
                  Contraseña
                </label>

                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>

              {error && (
                <p className="loginError">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="loginButton"
                disabled={cargando}
              >
                {cargando
                  ? "Iniciando sesión..."
                  : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}