"use client";

import { useEffect, useState } from "react";
import { X, UserRoundPen, UserLock } from "lucide-react";

const API =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws";

export default function PerfilModal({ seccionInicial, onClose }) {
  const [seccion, setSeccion] = useState(seccionInicial);

  const [usuario, setUsuario] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState("");

  const [pwdActual, setPwdActual] = useState("");
  const [pwdNuevo, setPwdNuevo] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarUsuario() {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorPerfil("No hay una sesión activa.");
        setCargandoPerfil(false);
        return;
      }

      try {
        const respuesta = await fetch(`${API}/api/v1/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.error || "No se pudo obtener el usuario.");
        }

        if (activo) {
          setUsuario(datos.usuario);
        }
      } catch (error) {
        if (activo) {
          setErrorPerfil(error.message);
        }
      } finally {
        if (activo) {
          setCargandoPerfil(false);
        }
      }
    }

    cargarUsuario();

    return () => {
      activo = false;
    };
  }, []);

  async function cambiarPwd(event) {
    event.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    if (pwdNuevo.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      setTipoMensaje("error");
      return;
    }

    if (pwdNuevo !== pwdConfirm) {
      setMensaje("Las contraseñas no coinciden.");
      setTipoMensaje("error");
      return;
    }

    setCargando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(`${API}/api/v1/auth/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password_actual: pwdActual,
          password_nueva: pwdNuevo,
        }),
      });

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
      setMensaje(error.message || "No se pudo cambiar la contraseña.");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rieti-modal-overlay">
      <div
        className="rieti-perfil-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Perfil y seguridad"
      >
        {/* Encabezado */}
        <div className="rieti-modal-header">
          <div>
            <h2>Mi cuenta</h2>
            <p>Consulta tu información personal y la seguridad de tu cuenta.</p>
          </div>

          <button type="button" onClick={onClose} aria-label="Cerrar ventana">
            <X size={22} />
          </button>
        </div>

        <div className="rieti-modal-tabs">
          <button
            type="button"
            className={seccion === "perfil" ? "active" : ""}
            onClick={() => setSeccion("perfil")}
          >
            <UserRoundPen size={20} />
            Mi perfil
          </button>

          <button
            type="button"
            className={seccion === "seguridad" ? "active" : ""}
            onClick={() => setSeccion("seguridad")}
          >
            <UserLock size={20} />
            Seguridad
          </button>
        </div>

        <div className="rieti-modal-content">
          {seccion === "perfil" && (
            <div className="rieti-modal-perfil">
              <h3>Información personal</h3>
              <p>Estos datos son administrados por el sistema.</p>

              {cargandoPerfil ? (
                <p>Cargando información...</p>
              ) : errorPerfil ? (
                <p role="alert">{errorPerfil}</p>
              ) : (
                <div className="perfil-datos">
                  <div className="perfil-dato">
                    <span>Nombre completo</span>
                    <strong>{usuario?.nombre || "—"}</strong>
                  </div>

                  <div className="perfil-dato">
                    <span>Correo institucional</span>
                    <strong>{usuario?.correo || "—"}</strong>
                  </div>

                  <div className="perfil-dato">
                    <span>Municipio</span>
                    <strong>{usuario?.municipio || "—"}</strong>
                  </div>

                  <div className="perfil-dato">
                    <span>Rol</span>
                    <strong>{usuario?.rol || "—"}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {seccion === "seguridad" && (
            <div className="rieti-modal-seguridad">
              <h3>Cambiar contraseña</h3>
              <p>Actualiza la contraseña utilizada para acceder al sistema.</p>

              <form className="seguridad-form" onSubmit={cambiarPwd}>
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
                    minLength={8}
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

                {mensaje && (
                  <p
                    className={`seguridad-mensaje ${tipoMensaje}`}
                    role="status"
                  >
                    {mensaje}
                  </p>
                )}

                <div className="seguridad-acciones">
                  <button
                    type="submit"
                    className="seguridad-button"
                    disabled={cargando}
                  >
                    {cargando ? "Actualizando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
