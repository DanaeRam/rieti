"use client";

import { useEffect, useState } from "react";

export default function Bitacora({ folio, cerrar }) {
  const [bitacora, setBitacora] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [accion, setAccion] = useState("");
  const [notaInterna, setNotaInterna] = useState("");
  const [hayCambioEstatus, setHayCambioEstatus] = useState(false);
  const [nuevoEstatus, setNuevoEstatus] = useState("");
  const [justificacion, setJustificacion] = useState("");

  const [guardando, setGuardando] = useState(false);

  const URL_BASE =
    "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

  async function obtenerBitacora() {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `${URL_BASE}/admin/reportes/${encodeURIComponent(folio)}/expediente`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudo obtener la bitácora.",
        );
      }

      setBitacora(datos.bitacora || []);
    } catch (error) {
      console.error("Error al obtener bitácora:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (folio) {
      obtenerBitacora();
    }
  }, [folio]);

  function limpiarFormulario() {
    setAccion("");
    setNotaInterna("");
    setHayCambioEstatus(false);
    setNuevoEstatus("");
    setJustificacion("");
    setError("");
  }

  function abrirFormulario() {
    limpiarFormulario();
    setMensaje("");
    setMostrarFormulario(true);
  }

  function cancelarFormulario() {
    limpiarFormulario();
    setMostrarFormulario(false);
  }
  async function registrarActuacion(event) {
    event.preventDefault();

    setError("");
    setMensaje("");

    if (!accion.trim()) {
      setError("Debes indicar la acción.");
      return;
    }

    if (!notaInterna.trim()) {
      setError("Debes escribir una nota interna.");
      return;
    }

    if (hayCambioEstatus && !nuevoEstatus) {
      setError("Debes seleccionar el nuevo estatus.");
      return;
    }

    if (hayCambioEstatus && !justificacion.trim()) {
      setError("Debes escribir una justificación.");
      return;
    }

    try {
      setGuardando(true);

      const token = localStorage.getItem("token");

      const datos = {
        folio: folio,
        accion: accion.trim(),
        nota_interna: notaInterna.trim(),
      };

      if (hayCambioEstatus) {
        datos.nuevo_estatus = nuevoEstatus;
        datos.justificacion = justificacion.trim();
      }

      const respuesta = await fetch(`${URL_BASE}/admin/atencion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.message ||
            resultado.error ||
            "No se pudo registrar la actuación.",
        );
      }

      limpiarFormulario();
      setMostrarFormulario(false);

      setMensaje(resultado.message || "Actuación registrada correctamente.");

      await obtenerBitacora();
    } catch (error) {
      console.error("Error al registrar actuación:", error);
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return "Fecha no disponible";
    }

    const fechaFormateada = new Date(fecha);

    if (Number.isNaN(fechaFormateada.getTime())) {
      return fecha;
    }

    return fechaFormateada.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className="rieti-bitacora"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-bitacora"
    >
      <div className="rieti-bitacora-header">
        <div>
          <h2 id="titulo-bitacora">Bitácora</h2>

          <p>
            Folio: <strong>{folio}</strong>
          </p>
        </div>

        <button
          type="button"
          className="rieti-bitacora-close"
          onClick={cerrar}
          aria-label="Cerrar bitácora"
        >
          Cerrar
        </button>
      </div>

      {!mostrarFormulario && (
        <div className="rieti-bitacora-actions">
          <button
            type="button"
            className="rieti-bitacora-add"
            onClick={abrirFormulario}
          >
            + Agregar actuación
          </button>
        </div>
      )}

      {mensaje && (
        <div className="rieti-bitacora-message success">{mensaje}</div>
      )}

      {error && <div className="rieti-bitacora-message error">{error}</div>}

      {mostrarFormulario && (
        <form className="rieti-bitacora-form" onSubmit={registrarActuacion}>
          <div className="rieti-bitacora-form-header">
            <div>
              <span>REGISTRO</span>
              <h3>Nueva actuación</h3>
            </div>
          </div>

          <div className="rieti-bitacora-field">
            <label htmlFor="accion">Acción</label>

            <input
              id="accion"
              type="text"
              value={accion}
              onChange={(event) => setAccion(event.target.value)}
              placeholder="Ej. Visita de campo"
            />
          </div>

          <div className="rieti-bitacora-field">
            <label htmlFor="notaInterna">Nota interna</label>

            <textarea
              id="notaInterna"
              value={notaInterna}
              onChange={(event) => setNotaInterna(event.target.value)}
              placeholder="Describe la actuación realizada..."
              rows={5}
            />
          </div>

          <div className="rieti-bitacora-status-question">
            <p>¿Existe un cambio de estatus?</p>

            <div className="rieti-bitacora-radio-group">
              <label>
                <input
                  type="radio"
                  name="cambioEstatus"
                  checked={!hayCambioEstatus}
                  onChange={() => {
                    setHayCambioEstatus(false);
                    setNuevoEstatus("");
                    setJustificacion("");
                  }}
                />
                <span>No</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="cambioEstatus"
                  checked={hayCambioEstatus}
                  onChange={() => setHayCambioEstatus(true)}
                />
                <span>Sí</span>
              </label>
            </div>
          </div>

          {hayCambioEstatus && (
            <div className="rieti-bitacora-status-box">
              <div className="rieti-bitacora-field">
                <label htmlFor="nuevoEstatus">Nuevo estatus</label>

                <select
                  id="nuevoEstatus"
                  value={nuevoEstatus}
                  onChange={(event) => setNuevoEstatus(event.target.value)}
                >
                  <option value="">Selecciona un estatus</option>
                  <option value="Recibido">Recibido</option>
                  <option value="En Revision">En Revisión</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Concluido">Concluido</option>
                  <option value="Reincidencia">Reincidencia</option>
                  <option value="Canalizado">Canalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="rieti-bitacora-field">
                <label htmlFor="justificacion">Justificación</label>

                <textarea
                  id="justificacion"
                  value={justificacion}
                  onChange={(event) => setJustificacion(event.target.value)}
                  placeholder="Indica por qué se realiza el cambio de estatus..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* BOTONES */}

          <div className="rieti-bitacora-form-actions">
            <button
              type="button"
              className="rieti-bitacora-cancel"
              onClick={cancelarFormulario}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rieti-bitacora-save"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar actuación"}
            </button>
          </div>
        </form>
      )}

      {/* ACTUACIONES */}

      {!mostrarFormulario && (
        <section className="rieti-bitacora-history">
          <div className="rieti-bitacora-section-header">
            <div>
              <span>REGISTRO OPERATIVO</span>
              <h3>Actuaciones anteriores</h3>
            </div>

            {!cargando && bitacora.length > 0 && (
              <small>
                {bitacora.length}{" "}
                {bitacora.length === 1 ? "actuación" : "actuaciones"}
              </small>
            )}
          </div>

          {cargando && (
            <div className="rieti-bitacora-empty">Cargando bitácora...</div>
          )}

          {!cargando && !error && bitacora.length === 0 && (
            <div className="rieti-bitacora-empty">
              <strong>No hay actuaciones registradas.</strong>
              <span>Las nuevas actuaciones aparecerán aquí.</span>
            </div>
          )}

          {!cargando && bitacora.length > 0 && (
            <div className="rieti-bitacora-list">
              {bitacora.map((item, indice) => (
                <article
                  className="rieti-bitacora-item"
                  key={item.idBitacora || indice}
                >
                  <div className="rieti-bitacora-item-marker">
                    <span />
                  </div>

                  <div className="rieti-bitacora-item-content">
                    <div className="rieti-bitacora-item-header">
                      <div>
                        <h4>{item.accion}</h4>
                        <span>{formatearFecha(item.fecha)}</span>
                      </div>
                    </div>

                    <p className="rieti-bitacora-item-note">
                      {item.nota_interna}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
