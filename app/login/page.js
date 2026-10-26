/**
 * Página de acceso para el personal administrativo de RIETI.
 *
 * @module app/login/page
 * @author Danae Ramírez
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * Presenta el formulario para iniciar sesión en el área administrativa.
 *
 * @component
 */
export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  /**
   * Envía las credenciales y guarda la sesión si la autenticación es correcta.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
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
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.message || datos.error || "No se pudo iniciar sesión");
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

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
          <div className="loginTop">
            <Link href="/" className="loginBack">
              <ArrowLeft size={18} />
              <span>Volver a RIETI</span>
            </Link>
          </div>

          <div className="loginContent">
            <div className="loginHeader">

              <h1>Plataforma administrativa</h1>

              <p>
                Ingresa con tus credenciales institucionales para acceder al
                panel administrativo.
              </p>
            </div>

            <div className="loginNotice">
              <div className="loginNoticeIcon">
                <LockKeyhole size={23} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Acceso restringido</strong>
                <p>
                  Este acceso está destinado únicamente al personal
                  administrativo autorizado de RIETI.
                </p>
              </div>
            </div>

            <form onSubmit={iniciarSesion}>
              <div className="loginField">
                <label htmlFor="correo">Correo institucional</label>

                <div className="loginInput">
                  <Mail size={19} />

                  <input
                    id="correo"
                    type="email"
                    autoComplete="username"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@dominio.gob.mx"
                    required
                  />
                </div>
              </div>

              <div className="loginField">
                <label htmlFor="contrasena">Contraseña</label>

                <div className="loginInput">
                  <LockKeyhole size={19} />

                  <input
                    id="contrasena"
                    type={mostrarContrasena ? "text" : "password"}
                    autoComplete="current-password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                  />

                  <button
                    type="button"
                    className="loginPasswordToggle"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    aria-label={
                      mostrarContrasena
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    aria-pressed={mostrarContrasena}
                  >
                    {mostrarContrasena ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="loginError" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="loginButton" disabled={cargando}>
                {cargando ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
