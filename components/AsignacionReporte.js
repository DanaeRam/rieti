"use client";

import { useEffect, useState } from "react";

const URL_BASE =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

export default function AsignacionReporte({
  reporte,
  cerrar,
  asignacionExitosa,
}) {
  const [alimentadores, setAlimentadores] = useState([]);
  const [idUsuario, setIdUsuario] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarAlimentadores() {
      setCargando(true);
      setAlimentadores([]);
      setIdUsuario("");
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay una sesión activa.");
        }

        const respuestaMunicipios = await fetch(`${URL_BASE}/municipios`, {
          signal: controlador.signal,
        });

        if (!respuestaMunicipios.ok) {
          throw new Error("No se pudieron cargar los municipios.");
        }

        const municipios = await respuestaMunicipios.json();

        const normalizar = (texto) =>
          String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();

        const municipio = municipios.find(
          (item) => normalizar(item.nombre) === normalizar(reporte.municipio),
        );

        if (!municipio) {
          throw new Error("No se encontró el municipio del reporte.");
        }

        const parametros = new URLSearchParams({
          idMunicipio: String(municipio.idMunicipio),
          idRol: "2",
          activo: "true",
        });

        const respuesta = await fetch(
          `${URL_BASE}/admin/usuarios?${parametros}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controlador.signal,
          },
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.message ||
              datos.error ||
              "No se pudieron cargar los alimentadores.",
          );
        }

        const usuarios = Array.isArray(datos.usuarios) ? datos.usuarios : [];

        const disponibles = usuarios.filter(
          (usuario) =>
            Number(usuario.idMunicipio) === Number(municipio.idMunicipio) &&
            Number(usuario.idRol) === 2 &&
            (usuario.activo === true ||
              usuario.activo === 1 ||
              usuario.activo === "1"),
        );

        if (!controlador.signal.aborted) {
          setAlimentadores(disponibles);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarAlimentadores();

    return () => controlador.abort();
  }, [reporte.municipio]);

  async function asignarReporte() {
    if (!idUsuario || guardando || cargando) return;

    const seleccionado = alimentadores.find(
      (usuario) => Number(usuario.idUsuario) === Number(idUsuario),
    );

    if (!seleccionado) {
      setError("Selecciona un alimentador válido.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay una sesión activa.");
      }

      const respuesta = await fetch(`${URL_BASE}/admin/asignaciones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folio: reporte.folio,
          idUsuario: Number(idUsuario),
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.status === 409) {
        throw new Error("Este reporte ya tiene un responsable asignado.");
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.message || datos.error || "No se pudo asignar el reporte.",
        );
      }

      await asignacionExitosa(datos);
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="rieti-asignacion-overlay">
      <div
        className="rieti-asignacion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asignacion-titulo"
      >
        <div className="rieti-asignacion-header">
          <div>
            <span>ASIGNACIÓN DE REPORTE</span>
            <h2 id="asignacion-titulo">Asignar responsable</h2>
            <p>Selecciona al funcionario que atenderá este reporte.</p>
          </div>

          <button
            type="button"
            className="rieti-asignacion-close"
            onClick={cerrar}
            disabled={guardando}
            aria-label="Cerrar asignación"
          >
            ×
          </button>
        </div>

        <div className="rieti-asignacion-content">
          <div className="rieti-asignacion-info">
            <div>
              <span>Folio del reporte</span>
              <strong>{reporte.folio}</strong>
            </div>

            <div>
              <span>Municipio</span>
              <strong>{reporte.municipio}</strong>
            </div>
          </div>

          <div className="rieti-asignacion-field">
            <label htmlFor="alimentador">Alimentador responsable</label>

            <select
              id="alimentador"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              disabled={cargando || guardando}
            >
              <option value="">
                {cargando
                  ? "Cargando alimentadores..."
                  : "Seleccionar alimentador"}
              </option>

              {alimentadores.map((usuario) => (
                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          {!cargando && alimentadores.length === 0 && !error && (
            <p className="rieti-asignacion-empty">
              No hay alimentadores activos en este municipio.
            </p>
          )}

          {error && (
            <p className="rieti-asignacion-error" role="alert">
              {error}
            </p>
          )}

          <div className="rieti-asignacion-actions">
            <button
              type="button"
              className="rieti-asignacion-button secondary"
              onClick={cerrar}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="rieti-asignacion-button primary"
              onClick={asignarReporte}
              disabled={!idUsuario || cargando || guardando}
            >
              {guardando ? "Asignando..." : "Asignar reporte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
