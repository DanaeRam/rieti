"use client";

import { useEffect, useState } from "react";

export default function Bitacora({ folio, cerrar }) {
  const [bitacora, setBitacora] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [accion, setAccion] = useState("");
  const [notaInterna, setNotaInterna] = useState("");
  const [hayCambioEstatus, setHayCambioEstatus] = useState(false);
  const [nuevoEstatus, setNuevoEstatus] = useState("");
  const [justificacion, setJustificacion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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
    setMensaje("");
    setError("");
  }

  function abrirFormulario() {
    limpiarFormulario();
    setMostrarFormulario(true);
  }

  function cancelarFormulario() {
    limpiarFormulario();
    setMostrarFormulario(false);
  }

  async function registrarActuacion(event) {
    event.preventDefault();

    setMensaje("");
    setError("");

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

      setMensaje(resultado.message || "Actuación registrada correctamente.");

      limpiarFormulario();
      setMostrarFormulario(false);

      await obtenerBitacora();
    } catch (error) {
      console.error("Error al registrar actuación:", error);
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true">
      <h2>Bitácora</h2>

      <p>Folio: {folio}</p>

      <button type="button" onClick={cerrar}>
        Cerrar
      </button>

      {!mostrarFormulario && (
        <button type="button" onClick={abrirFormulario}>
          + Agregar actuación
        </button>
      )}

      {mensaje && <p>{mensaje}</p>}

      {error && <p>{error}</p>}

      {mostrarFormulario && (
        <form onSubmit={registrarActuacion}>
          <h3>Nueva actuación</h3>

          <div>
            <label htmlFor="accion">Acción</label>

            <input
              id="accion"
              type="text"
              value={accion}
              onChange={(event) => setAccion(event.target.value)}
              placeholder="Ej. Visita de campo"
            />
          </div>

          <div>
            <label htmlFor="notaInterna">Nota interna</label>

            <textarea
              id="notaInterna"
              value={notaInterna}
              onChange={(event) => setNotaInterna(event.target.value)}
              placeholder="Describe la actuación realizada..."
              rows={5}
            />
          </div>

          <div>
            <p>¿Existe un cambio de estatus?</p>

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
              No
            </label>

            <label>
              <input
                type="radio"
                name="cambioEstatus"
                checked={hayCambioEstatus}
                onChange={() => setHayCambioEstatus(true)}
              />
              Sí
            </label>
          </div>

          {hayCambioEstatus && (
            <>
              <div>
                <label htmlFor="nuevoEstatus">Nuevo estatus</label>

                <select
                  id="nuevoEstatus"
                  value={nuevoEstatus}
                  onChange={(event) => setNuevoEstatus(event.target.value)}
                >
                  <option value="">Selecciona un estatus</option>

                  <option value="Recibido">Recibido</option>

                  <option value="En Revision">En Revision</option>

                  <option value="En Proceso">En Proceso</option>

                  <option value="Concluido">Concluido</option>

                  <option value="Reincidencia">Reincidencia</option>

                  <option value="Canalizado">Canalizado</option>

                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label htmlFor="justificacion">Justificación</label>

                <textarea
                  id="justificacion"
                  value={justificacion}
                  onChange={(event) => setJustificacion(event.target.value)}
                  placeholder="Indica por qué se realiza el cambio de estatus..."
                  rows={4}
                />
              </div>
            </>
          )}

          <div>
            <button
              type="button"
              onClick={cancelarFormulario}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar actuación"}
            </button>
          </div>
        </form>
      )}

      {!mostrarFormulario && (
        <>
          <h3>Actuaciones anteriores</h3>

          {cargando && <p>Cargando bitácora...</p>}

          {!cargando && bitacora.length === 0 && (
            <p>No hay actuaciones registradas.</p>
          )}

          {!cargando && bitacora.length > 0 && (
            <div>
              {bitacora.map((item, indice) => (
                <div key={indice}>
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
