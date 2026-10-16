"use client";

import { useEffect, useState } from "react";

export default function ExpedienteDigital({ expediente, cerrar }) {
  const [pestana, setPestana] = useState("encabezado");
  const [datosExpediente, setDatosExpediente] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [urlsEvidencias, setUrlsEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);
  const [errorEvidencias, setErrorEvidencias] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expediente?.folio) return;

    const controlador = new AbortController();

    async function cargarExpediente() {
      setCargando(true);
      setError("");
      setDatosExpediente(null);
      setEvidencias([]);
      setUrlsEvidencias([]);

      try {
        const token = localStorage.getItem("token");

        const respuesta = await fetch(
          `https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/reportes/${encodeURIComponent(expediente.folio)}/expediente`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controlador.signal,
          },
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.message || datos.error || "No se pudo cargar el expediente.",
          );
        }

        setDatosExpediente(datos.expediente || null);
        setEvidencias(datos.evidencias || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message || "Error al consultar el expediente.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarExpediente();

    return () => controlador.abort();
  }, [expediente?.folio]);

  useEffect(() => {
    if (pestana !== "evidencias" || cargando) return;

    const controlador = new AbortController();

    async function cargarFotografias() {
      setUrlsEvidencias([]);
      setErrorEvidencias("");

      if (evidencias.length === 0) {
        setCargandoEvidencias(false);
        return;
      }

      setCargandoEvidencias(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay una sesión activa.");
        }

        const resultados = await Promise.allSettled(
          evidencias.map(async (evidencia) => {
            const respuesta = await fetch(
              "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/evidencias/url-lectura",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  key: evidencia.ruta_s3,
                }),
                signal: controlador.signal,
              },
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
              throw new Error(
                datos.message ||
                  datos.error ||
                  "No se pudo cargar la fotografía.",
              );
            }

            if (!datos.urlLectura) {
              throw new Error("La API no devolvió una URL de lectura.");
            }

            return {
              ...evidencia,
              url: datos.urlLectura,
            };
          }),
        );

        if (controlador.signal.aborted) return;

        const disponibles = resultados
          .filter((resultado) => resultado.status === "fulfilled")
          .map((resultado) => resultado.value);

        setUrlsEvidencias(disponibles);

        if (disponibles.length < evidencias.length) {
          setErrorEvidencias("Algunas fotografías no se pudieron cargar.");
        }
      } catch (error) {
        if (!controlador.signal.aborted) {
          setErrorEvidencias(
            error.message || "No se pudieron cargar las evidencias.",
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoEvidencias(false);
        }
      }
    }

    cargarFotografias();

    return () => controlador.abort();
  }, [pestana, evidencias, cargando]);

  if (!expediente) {
    return null;
  }

  const reporte = datosExpediente || expediente;

  return (
    <div className="expediente-overlay">
      <div className="expediente-ventana">
        <div className="expediente-pestanas">
          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "encabezado" ? "activa" : ""
            }`}
            onClick={() => setPestana("encabezado")}
          >
            Encabezado
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "informacion" ? "activa" : ""
            }`}
            onClick={() => setPestana("informacion")}
          >
            Información
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "geolocalizacion" ? "activa" : ""
            }`}
            onClick={() => setPestana("geolocalizacion")}
          >
            Geolocalización
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "evidencias" ? "activa" : ""
            }`}
            onClick={() => setPestana("evidencias")}
          >
            Evidencias
          </button>

          <button
            type="button"
            className="expediente-cerrar"
            onClick={cerrar}
            aria-label="Cerrar expediente"
          >
            ×
          </button>
        </div>

        <div className="expediente-contenido">
          {cargando && (
            <p className="expediente-aviso">
              Cargando información del expediente...
            </p>
          )}

          {error && (
            <p className="expediente-aviso error" role="alert">
              {error}
            </p>
          )}
          {pestana === "encabezado" && (
            <section className="expediente-seccion">
              <h3>Encabezado</h3>

              <div className="expediente-datos">
                <div className="expediente-dato">
                  <span>Folio</span>
                  <strong>{reporte.folio}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Municipio asignado</span>
                  <strong>
                    {reporte.nombre_municipio || reporte.municipio || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Alimentador asignado</span>
                  <strong>No disponible..</strong>
                </div>

                <div className="expediente-dato">
                  <span>Estatus</span>
                  <strong>{reporte.estatus || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Prioridad</span>
                  <strong>{reporte.prioridad || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Modalidad</span>
                  <strong>
                    {reporte.modalidad === "ANONIMO"
                      ? "Anónimo"
                      : reporte.modalidad === "SEGUIMIENTO"
                        ? "Con seguimiento"
                        : "—"}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {pestana === "informacion" && (
            <section className="expediente-seccion">
              <h3>Información</h3>

              <div className="expediente-datos">
                <div className="expediente-dato">
                  <span>Fecha de registro</span>
                  <strong>
                    {reporte.fecha_registro
                      ? new Date(reporte.fecha_registro).toLocaleString("es-MX")
                      : "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Última atención</span>
                  <strong>
                    {reporte.fecha_ultima_atencion
                      ? new Date(reporte.fecha_ultima_atencion).toLocaleString(
                          "es-MX",
                        )
                      : "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Tipo de actividad</span>
                  <strong>
                    {reporte.nombre_actividad || reporte.actividad || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>NNA aproximados</span>
                  <strong>{reporte.num_menores ?? "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Rango de edad</span>
                  <strong>{reporte.rango_edad || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Género observado</span>
                  <strong>{reporte.genero_observado || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Hora observada</span>
                  <strong>{reporte.hora_observada || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Situación de riesgo</span>
                  <strong>
                    {reporte.situacion_riesgo == null
                      ? "—"
                      : Number(reporte.situacion_riesgo) === 1
                        ? "Sí"
                        : "No"}
                  </strong>
                </div>
              </div>

              <div className="expediente-descripcion">
                <span>Descripción de los hechos</span>
                <p>{reporte.descripcion || "—"}</p>
              </div>
            </section>
          )}

          {pestana === "geolocalizacion" && (
            <section className="expediente-seccion">
              <h3>Geolocalización</h3>

              <div className="expediente-datos">
                <div className="expediente-dato">
                  <span>Municipio</span>
                  <strong>
                    {reporte.nombre_municipio || reporte.municipio || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Calle</span>
                  <strong>{reporte.calle || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Colonia</span>
                  <strong>{reporte.colonia || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Código postal</span>
                  <strong>{reporte.cp || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Latitud</span>
                  <strong>{reporte.latitud || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Longitud</span>
                  <strong>{reporte.longitud || "—"}</strong>
                </div>
              </div>

              <div className="expediente-descripcion">
                <span>Referencias de ubicación</span>
                <p>{reporte.referencias || "—"}</p>
              </div>
            </section>
          )}

          {pestana === "evidencias" && (
            <section className="expediente-seccion">
              <h3>Evidencias fotográficas</h3>

              {!cargando && evidencias.length === 0 && !error && (
                <p>No hay evidencias disponibles para este reporte.</p>
              )}

              {cargandoEvidencias && <p>Cargando fotografías...</p>}

              {errorEvidencias && (
                <p className="expediente-aviso error" role="alert">
                  {errorEvidencias}
                </p>
              )}

              {!cargandoEvidencias && urlsEvidencias.length > 0 && (
                <div className="expediente-evidencias">
                  {urlsEvidencias.map((evidencia) => (
                    <div
                      key={evidencia.idEvidencia}
                      className="expediente-evidencia"
                    >
                      <img
                        src={evidencia.url}
                        alt={`Evidencia fotográfica ${evidencia.idEvidencia}`}
                      />

                      <div className="expediente-evidencia-info">
                        <span>
                          Fecha de carga:{" "}
                          {new Date(evidencia.fecha_carga).toLocaleString(
                            "es-MX",
                          )}
                        </span>

                        <span>
                          Fecha de purga:{" "}
                          {new Date(evidencia.fecha_purga).toLocaleString(
                            "es-MX",
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
