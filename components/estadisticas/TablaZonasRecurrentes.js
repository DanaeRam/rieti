
/**
 * Tabla de zonas con reportes cercanos entre sí.
 *
 * @module components/estadisticas/TablaZonasRecurrentes
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FolderOpen, MapPin } from "lucide-react";

const RADIOS = [50, 100, 200, 500];

/**
 * Valida las coordenadas de un reporte para agrupar su ubicación.
 *
 * @param {Object} reporte - Reporte con latitud y longitud.
 * @returns {{lat: number, lon: number}|null} Coordenadas válidas o null.
 */
function obtenerCoordenadas(reporte) {
  if (
    reporte.latitud == null ||
    reporte.longitud == null ||
    String(reporte.latitud).trim() === "" ||
    String(reporte.longitud).trim() === ""
  ) {
    return null;
  }

  const lat = Number(reporte.latitud);
  const lon = Number(reporte.longitud);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180 ||
    (lat === 0 && lon === 0)
  ) {
    return null;
  }

  return { lat, lon };
}

/**
 * Agrupa reportes cercanos y calcula sus datos de proximidad.
 *
 * @param {Object} L - Instancia de Leaflet para medir distancias.
 * @param {Array<Object>} reportes - Reportes con datos de ubicación.
 * @param {number} radio - Distancia máxima entre reportes del grupo.
 * @returns {Array<Object>} Zonas con reportes cercanos.
 */
function crearZonas(L, reportes, radio) {
  const puntos = reportes
    .map((reporte, indice) => {
      const coordenadas = obtenerCoordenadas(reporte);

      if (!coordenadas) return null;

      return {
        ...coordenadas,
        reporte,
        clave: `${reporte.folio ?? "reporte"}-${indice}`,
        punto: L.latLng(coordenadas.lat, coordenadas.lon),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.lat - b.lat ||
        a.lon - b.lon ||
        a.clave.localeCompare(b.clave)
    );

  const grupos = [];

  puntos.forEach((punto) => {
    let mejorGrupo = null;
    let menorDistancia = Infinity;

    grupos.forEach((grupo) => {
      const distancias = grupo.puntos.map((otro) =>
        punto.punto.distanceTo(otro.punto)
      );

      const distanciaMaxima = Math.max(...distancias);

      if (
        distanciaMaxima <= radio &&
        distanciaMaxima < menorDistancia
      ) {
        mejorGrupo = grupo;
        menorDistancia = distanciaMaxima;
      }
    });

    if (mejorGrupo) {
      mejorGrupo.puntos.push(punto);
    } else {
      grupos.push({ puntos: [punto] });
    }
  });

  return grupos
    .filter((grupo) => grupo.puntos.length >= 2)
    .map((grupo) => {
      const municipios = [
        ...new Set(
          grupo.puntos
            .map(({ reporte }) => reporte.municipio)
            .filter(Boolean)
            .map(String)
        ),
      ];

      let distanciaMaxima = 0;

      for (let i = 0; i < grupo.puntos.length; i++) {
        for (let j = i + 1; j < grupo.puntos.length; j++) {
          const distancia = grupo.puntos[i].punto.distanceTo(
            grupo.puntos[j].punto
          );

          distanciaMaxima = Math.max(
            distanciaMaxima,
            distancia
          );
        }
      }

      return {
        id: grupo.puntos.map((punto) => punto.clave).join("|"),
        reportes: grupo.puntos.map((punto) => punto.reporte),
        total: grupo.puntos.length,
        distanciaMaxima,
        municipio:
          municipios.length === 0
            ? "Sin especificar"
            : municipios.length === 1
              ? municipios[0]
              : "Varios municipios",
      };
    })
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.distanciaMaxima - b.distanciaMaxima
    );
}

/**
 * Muestra grupos de reportes con ubicaciones cercanas.
 *
 * @component
 */
export default function TablaZonasRecurrentes({
  reportes = [],
  cargando = false,
  error = "",
  onVerExpediente,
}) {
  const [L, setLeaflet] = useState(null);
  const [radio, setRadio] = useState(100);
  const [zonaAbierta, setZonaAbierta] = useState(null);

  useEffect(() => {
    let activo = true;

    import("leaflet")
      .then((modulo) => {
        if (activo) setLeaflet(modulo.default ?? modulo);
      })
      .catch((error) => {
        console.error("No se pudo cargar Leaflet:", error);
      });

    return () => {
      activo = false;
    };
  }, []);

  const zonas = useMemo(() => {
    if (!L || !Array.isArray(reportes)) return [];

    return crearZonas(L, reportes, radio);
  }, [L, reportes, radio]);

  const reportesAgrupados = zonas.reduce(
    (total, zona) => total + zona.total,
    0
  );

  return (
    <article className="rieti-panel rieti-zonas-panel">
      <div className="rieti-panel-header">
        <div>
          <span>ANÁLISIS DE PROXIMIDAD</span>
          <h3>Zonas recurrentes y posibles duplicados</h3>
        </div>

        <span className="estadisticas-etiqueta">
          {zonas.length} zonas detectadas
        </span>
      </div>

      <div className="rieti-zonas-contenido">
        <div className="rieti-zonas-herramientas">
          <p>
            Se identificaron {reportesAgrupados} reportes en grupos
            de proximidad geográfica.
          </p>

          <label className="rieti-zonas-filtro">
            <span>Radio de proximidad</span>

            <select
              value={radio}
              onChange={(evento) => {
                setRadio(Number(evento.target.value));
                setZonaAbierta(null);
              }}
            >
              {RADIOS.map((valor) => (
                <option key={valor} value={valor}>
                  {valor} metros
                </option>
              ))}
            </select>
          </label>
        </div>

        {cargando || (!L && !error) ? (
          <p className="rieti-zonas-mensaje">
            Analizando ubicaciones...
          </p>
        ) : error ? (
          <p className="rieti-zonas-mensaje" role="alert">
            No se pudieron cargar los reportes: {error}
          </p>
        ) : zonas.length === 0 ? (
          <p className="rieti-zonas-mensaje">
            No se identificaron grupos de dos o más reportes
            dentro del radio seleccionado.
          </p>
        ) : (
          <div className="rieti-zonas-tabla-scroll">
            <table className="rieti-zonas-tabla">
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Municipio</th>
                  <th>Reportes</th>
                  <th>Separación máxima</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {zonas.map((zona, indice) => {
                  const abierta = zonaAbierta === zona.id;

                  return (
                    <tr key={zona.id}>
                      <td colSpan={5} className="rieti-zonas-fila">
                        <div className="rieti-zonas-fila-principal">
                          <div className="rieti-zonas-celda-zona">
                            <MapPin size={17} />
                            <strong>
                              Zona {String(indice + 1).padStart(2, "0")}
                            </strong>
                          </div>

                          <span>{zona.municipio}</span>

                          <span className="rieti-zonas-cantidad">
                            {zona.total} reportes
                          </span>

                          <span>
                            {Math.round(zona.distanciaMaxima)} m
                          </span>

                          <button
                            type="button"
                            className="rieti-zonas-boton"
                            onClick={() =>
                              setZonaAbierta(
                                abierta ? null : zona.id
                              )
                            }
                            aria-expanded={abierta}
                          >
                            <FolderOpen size={17} />
                            Ver reportes
                            {abierta ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </button>
                        </div>

                        {abierta && (
                          <div className="rieti-zonas-detalle">
                            {zona.reportes.map((reporte, i) => (
                              <div
                                className="rieti-zonas-expediente"
                                key={`${reporte.folio ?? "sin-folio"}-${i}`}
                              >
                                <div>
                                  <strong>
                                    {reporte.folio ?? "Sin folio"}
                                  </strong>

                                  <span>
                                    Prioridad:{" "}
                                    {reporte.prioridad ?? "No indicada"}
                                    {" · "}
                                    Estatus:{" "}
                                    {reporte.estatus ?? "No indicado"}
                                  </span>
                                </div>

                                {typeof onVerExpediente === "function" && (
                                  <button
                                    type="button"
                                    className="rieti-zonas-boton"
                                    onClick={() =>
                                      onVerExpediente(reporte)
                                    }
                                  >
                                    <FolderOpen size={16} />
                                    Ver expediente
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="rieti-zonas-nota">
          Los grupos indican proximidad geográfica, no duplicados
          confirmados.
        </p>
      </div>
    </article>
  );
}
