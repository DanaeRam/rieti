"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  function iniciarSesion(event) {
    event.preventDefault();

    console.log("Correo:", correo);
    console.log("Contraseña:", contrasena);
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
                  onChange={(event) => setCorreo(event.target.value)}
                  placeholder="correo@institucion.gob.mx"
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
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>

              <button
                type="submit"
                className="loginButton"
              >
                Iniciar sesión
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}