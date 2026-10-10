"use client";

import { useState } from "react";

export default function Seguridad() {
  const [pwdActual, setPwdActual] = useState("");
  const [pwdNuevo, setPwdNuevo] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  async function cambiarPwd() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/auth/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password_actual: pwdActual,
            password_nueva: pwdNuevo,
          }),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudo cambiar la contraseña.",
        );
      }

      setMensaje("La contraseña fue actualizada correctamente.");
      setTipoMensaje("success");

      setPwdActual("");
      setPwdNuevo("");
      setPwdConfirm("");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);

      setMensaje(error.message || "No se pudo cambiar la contraseña.");

      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <div className="rieti-page-title">
        <h2>Seguridad</h2>
      </div>

      <section className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>SEGURIDAD</span>
            <h3>Cambiar contraseña</h3>
          </div>
        </div>

        <div className="perfil-contenido" onSubmit={cambiarPwd}>
          <form className="seguridad-form">
            <div className="seguridad-dato">
              <label htmlFor="pwdActual">Contraseña actual</label>

              <input
                id="pwdActual"
                type="password"
                value={pwdActual}
                onChange={(e) => setPwdActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </div>

            <div className="seguridad-dato">
              <label htmlFor="pwdNuevo">Nueva contraseña</label>

              <input
                id="pwdNuevo"
                type="password"
                value={pwdNuevo}
                onChange={(e) => setPwdNuevo(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                required
              />

              <small>La contraseña debe tener al menos 8 caracteres.</small>
            </div>

            <div className="seguridad-dato">
              <label htmlFor="pwdConfirm">Confirmar nueva contraseña</label>

              <input
                id="pwdConfirm"
                type="password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                required
              />
            </div>

            <div className="seguridad-acciones">
              <button type="submit" className="seguridad-button">
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
