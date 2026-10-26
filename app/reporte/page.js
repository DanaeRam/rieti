/**
 * Formulario público para registrar reportes en RIETI.
 *
 * @module app/reporte/page
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Copy,
  Share2,
  MapPin,
  LocateFixed,
  Upload,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronRight,
} from "lucide-react";
import MapaUbicacion from "@/components/MapaUbicacion";

const API_BASE =
  "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1";

const PASOS = ["Información general", "Ubicación", "Confirmación y envío"];

const MAX_FOTOS = 2;
const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

/**
 * Busca el nombre asociado a una opción seleccionada.
 *
 * @param {Array<Object>} lista - Opciones disponibles.
 * @param {string|number} id - Identificador seleccionado.
 * @param {string} campoId - Nombre del campo que contiene el identificador.
 * @returns {string} Nombre de la opción o texto predeterminado.
 */
function textoOpcion(lista, id, campoId) {
  return (
    lista.find((item) => String(item[campoId]) === String(id))?.nombre ||
    "No especificado"
  );
}

/**
 * Formulario público de reportes de RIETI.
 *
 * Permite elegir modalidad, registrar información
 * general, seleccionar una ubicación, adjuntar
 * fotografías y confirmar el envío.
 *
 * @component
 */
export default function Reporte() {
  const router = useRouter();

  const [paso, setPaso] = useState(0);
  const [modalidad, setModalidad] = useState("SEGUIMIENTO");
  const [correoContacto, setCorreoContacto] = useState("");

  const [numNinos, setNumNinos] = useState("");
  const [rangoEdad, setRangoEdad] = useState("");
  const [generoObservado, setGeneroObservado] = useState("");
  const [actividad, setActividad] = useState("");
  const [actividades, setActividades] = useState([]);
  const [horaObservada, setHoraObservada] = useState("");
  const [situacionRiesgo, setSituacionRiesgo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [municipio, setMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [cp, setCp] = useState("");
  const [referencias, setReferencias] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [errorUbicacion, setErrorUbicacion] = useState("");

  const [fotografias, setFotografias] = useState([]);
  const [resultadosFotos, setResultadosFotos] = useState([]);

  const [aceptoAviso, setAceptoAviso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [folioRegistrado, setFolioRegistrado] = useState("");
  const [estatusRegistrado, setEstatusRegistrado] = useState("");
  const [envioCompleto, setEnvioCompleto] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();

    /**
     * Carga un catálogo y guarda una lista segura para el formulario.
     *
     * @param {string} ruta - Ruta del catálogo en la API.
     * @param {Function} guardar - Función que actualiza el catálogo.
     */
    async function cargarCatalogo(ruta, guardar) {
      try {
        const respuesta = await fetch(`${API_BASE}${ruta}`, {
          signal: controlador.signal,
        });

        if (!respuesta.ok) {
          throw new Error(`No se pudo cargar ${ruta}`);
        }

        const datos = await respuesta.json();

        if (!controlador.signal.aborted) {
          guardar(Array.isArray(datos) ? datos : []);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    cargarCatalogo("/catalogos/actividades", setActividades);
    cargarCatalogo("/municipios", setMunicipios);

    return () => controlador.abort();
  }, []);

  /** Guarda las coordenadas elegidas en el mapa o por GPS. */
  function seleccionarUbicacion(lat, lng) {
    setLatitud(lat);
    setLongitud(lng);
    setErrorUbicacion("");
  }

  /** Solicita la ubicación actual del dispositivo. */
  function usarGPS() {
    if (!navigator.geolocation) {
      setErrorUbicacion(
        "Tu dispositivo no admite geolocalización. Selecciona el lugar en el mapa.",
      );
      return;
    }

    setErrorUbicacion("");

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        seleccionarUbicacion(
          posicion.coords.latitude,
          posicion.coords.longitude,
        );
      },
      () => {
        setErrorUbicacion(
          "No se pudo obtener la ubicación. Permite el acceso al GPS o selecciona un punto en el mapa.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    );
  }

  /** Comprueba los campos obligatorios de información general. */
  function validarGeneral() {
    if (
      !numNinos ||
      !rangoEdad ||
      !generoObservado ||
      !actividad ||
      !descripcion.trim() ||
      !situacionRiesgo
    ) {
      setErrorEnvio("Completa los campos del paso 1 antes de continuar.");
      return false;
    }

    setErrorEnvio("");
    return true;
  }

  /** Comprueba las coordenadas y el municipio seleccionados. */
  function validarUbicacion() {
    if (
      latitud === "" ||
      longitud === "" ||
      !Number.isFinite(Number(latitud)) ||
      !Number.isFinite(Number(longitud)) ||
      Math.abs(Number(latitud)) > 90 ||
      Math.abs(Number(longitud)) > 180
    ) {
      setErrorUbicacion(
        "Selecciona un punto válido en el mapa o utiliza el GPS.",
      );
      return false;
    }

    if (!municipio) {
      setErrorUbicacion("Selecciona el municipio del lugar reportado.");
      return false;
    }

    setErrorUbicacion("");
    return true;
  }

  /** Valida el paso actual y avanza al siguiente paso del formulario. */
  function siguiente() {
    if (
      paso === 0 &&
      modalidad === "SEGUIMIENTO" &&
      !/^\S+@\S+\.\S+$/.test(correoContacto.trim())
    ) {
      setErrorEnvio(
        "Ingresa un correo electrónico válido para el seguimiento.",
      );
      return;
    }

    if (paso === 1 && !validarGeneral()) return;
    if (paso === 2 && !validarUbicacion()) return;

    setErrorEnvio("");
    setPaso((actual) => Math.min(actual + 1, 3));
  }

  /**
   * Valida y agrega fotografías seleccionadas por la persona usuaria.
   *
   * @param {Event} evento - Evento de selección de archivos.
   */
  function agregarFotografias(evento) {
    const seleccionados = Array.from(evento.target.files || []);

    evento.target.value = "";
    setErrorUbicacion("");

    if (seleccionados.some((foto) => !TIPOS_FOTO.includes(foto.type))) {
      setErrorUbicacion("Solo puedes adjuntar fotografías JPG, PNG o WEBP.");
      return;
    }

    const sinDuplicados = seleccionados.filter(
      (foto) =>
        !fotografias.some(
          (actual) =>
            actual.name === foto.name &&
            actual.size === foto.size &&
            actual.lastModified === foto.lastModified,
        ),
    );

    if (fotografias.length + sinDuplicados.length > MAX_FOTOS) {
      setErrorUbicacion("Puedes adjuntar un máximo de 2 fotografías.");
      return;
    }

    setFotografias((anteriores) => [...anteriores, ...sinDuplicados]);
  }

  /**
   * Solicita la carga, sube y confirma una fotografía del reporte.
   *
   * @param {File} archivo - Fotografía que se va a subir.
   * @param {string} folioReporte - Folio del reporte asociado.
   * @returns {Promise<Object>} Confirmación de la API.
   */
  async function subirFotografia(archivo, folioReporte) {
    const respuestaUrl = await fetch(`${API_BASE}/evidencias/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folio: folioReporte,
        nombreArchivo: archivo.name,
        fileType: archivo.type,
      }),
    });

    const datosUrl = await respuestaUrl.json();

    if (!respuestaUrl.ok || !datosUrl.uploadUrl || !datosUrl.key) {
      throw new Error(
        datosUrl.message ||
          datosUrl.error ||
          `No se pudo preparar ${archivo.name}.`,
      );
    }

    const respuestaS3 = await fetch(datosUrl.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": archivo.type,
      },
      body: archivo,
    });

    if (!respuestaS3.ok) {
      throw new Error(`No se pudo subir ${archivo.name}.`);
    }

    const respuestaConfirmacion = await fetch(
      `${API_BASE}/evidencias/confirmar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folio: folioReporte,
          key: datosUrl.key,
        }),
      },
    );

    const confirmacion = await respuestaConfirmacion.json();

    if (!respuestaConfirmacion.ok) {
      throw new Error(
        confirmacion.message ||
          confirmacion.error ||
          `No se pudo confirmar ${archivo.name}.`,
      );
    }

    return confirmacion;
  }

  /** Registra el reporte y procesa sus fotografías adjuntas. */
  async function enviarReporte() {
    if (enviando || !aceptoAviso) return;
    if (!validarGeneral() || !validarUbicacion()) return;

    if (
      modalidad === "SEGUIMIENTO" &&
      !/^\S+@\S+\.\S+$/.test(correoContacto.trim())
    ) {
      setErrorEnvio("Ingresa un correo electrónico válido.");
      return;
    }

    setEnviando(true);
    setErrorEnvio("");

    let folioActual = folioRegistrado;

    try {
      if (!folioActual) {
        const cuerpo = {
          idMunicipio: Number(municipio),
          idCatalogoActividad: Number(actividad),
          modalidad,
          correo_contacto:
            modalidad === "SEGUIMIENTO" ? correoContacto.trim() : null,
          num_menores: Number(numNinos),
          rango_edad: rangoEdad,
          genero_observado: generoObservado,
          hora_observada: horaObservada ? `${horaObservada}:00` : undefined,
          descripcion: descripcion.trim(),
          situacion_riesgo:
            situacionRiesgo === "nose" ? null : situacionRiesgo === "true",
          latitud: Number(latitud),
          longitud: Number(longitud),
          calle: calle.trim(),
          colonia: colonia.trim(),
          cp: cp.trim() || null,
          referencias: referencias.trim() || null,
          acepto_aviso: true,
        };

        const respuesta = await fetch(`${API_BASE}/reportes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cuerpo),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            datos.message || datos.error || "No se pudo enviar el reporte.",
          );
        }

        if (!datos.folio) {
          throw new Error(
            "El servidor no devolvió un identificador del reporte.",
          );
        }

        folioActual = datos.folio;
        setFolioRegistrado(folioActual);
        setEstatusRegistrado(datos.estatus || "Recibido");
      }

      const exitosPrevios = resultadosFotos.filter((item) => item.exito);

      const pendientes = fotografias.filter(
        (foto) =>
          !exitosPrevios.some(
            (item) =>
              item.nombre === foto.name &&
              item.tamano === foto.size &&
              item.ultimaModificacion === foto.lastModified,
          ),
      );

      const nuevos = [];

      for (const archivo of pendientes) {
        try {
          await subirFotografia(archivo, folioActual);

          nuevos.push({
            nombre: archivo.name,
            tamano: archivo.size,
            ultimaModificacion: archivo.lastModified,
            exito: true,
          });
        } catch (error) {
          console.error("Error al subir fotografía:", error);

          nuevos.push({
            nombre: archivo.name,
            tamano: archivo.size,
            ultimaModificacion: archivo.lastModified,
            exito: false,
          });
        }
      }

      setResultadosFotos([...exitosPrevios, ...nuevos]);

      if (nuevos.some((item) => !item.exito)) {
        setErrorEnvio(
          "El reporte ya fue registrado, pero alguna fotografía no se pudo subir. Pulsa «Reintentar fotografías»; no se creará otro reporte.",
        );
        return;
      }

      setEnvioCompleto(true);
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      setErrorEnvio(error.message || "No se pudo enviar el reporte.");
    } finally {
      setEnviando(false);
    }
  }

  /** Copia el folio registrado al portapapeles. */
  async function copiarFolio() {
    try {
      await navigator.clipboard.writeText(folioRegistrado);
      setCopiado(true);
    } catch {
      setErrorEnvio(
        "No se pudo copiar automáticamente. Selecciona el folio para copiarlo.",
      );
    }
  }

  /** Comparte el folio de seguimiento o copia el enlace como alternativa. */
  async function compartirFolio() {
    const url = `${window.location.origin}/seguimiento`;
    const texto = `Consulta tu reporte RIETI con el folio ${folioRegistrado}: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Seguimiento RIETI",
          text: texto,
          url,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorEnvio("No se pudo compartir el folio.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
      } catch {
        setErrorEnvio("No se pudo copiar la información para compartir.");
      }
    }
  }

  const riesgoTexto =
    situacionRiesgo === "true"
      ? "Sí"
      : situacionRiesgo === "false"
        ? "No"
        : "No sé";

  const nombreMunicipio = textoOpcion(municipios, municipio, "idMunicipio");

  const nombreActividad = textoOpcion(
    actividades,
    actividad,
    "idCatalogoActividad",
  );

  if (envioCompleto) {
    return (
      <main className="reporte-page">
        <section
          className="reporte-card reporte-confirmacion-final"
          role="status"
        >
          <div className="reporte-exito-icono">
            <Check size={36} />
          </div>

          <span className="reporte-kicker">REPORTE REGISTRADO</span>

          <h1>¡Gracias por compartir lo que observaste!</h1>

          <p>Tu reporte fue recibido correctamente por RIETI.</p>

          {modalidad === "SEGUIMIENTO" ? (
            <div className="reporte-folio-final">
              <span>Tu folio de seguimiento</span>
              <strong>{folioRegistrado}</strong>

              <small>
                Estatus actual: {estatusRegistrado}. Guarda este folio para
                consultar el avance de tu reporte.
              </small>

              <div className="reporte-botones reporte-folio-acciones">
                <button
                  type="button"
                  className="secundario"
                  onClick={copiarFolio}
                >
                  <Copy size={17} />
                  {copiado ? "Copiado" : "Copiar folio"}
                </button>

                <button
                  type="button"
                  className="primario"
                  onClick={compartirFolio}
                >
                  <Share2 size={17} />
                  Compartir
                </button>
              </div>
            </div>
          ) : (
            <div className="reporte-aviso-anonimo">
              Reporte registrado correctamente. No es necesario proporcionar
              datos de contacto.
            </div>
          )}

          {errorEnvio && (
            <p className="reporte-error" role="alert">
              {errorEnvio}
            </p>
          )}

          <button
            type="button"
            className="reporte-volver-inicio"
            onClick={() => router.push("/")}
          >
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="reporte-page">
      <div className="reporte-container">
        <nav className="reporte-breadcrumb" aria-label="Navegación">
          <Link href="/">
            <Home size={16} />
            Inicio
          </Link>

          <ChevronRight size={15} />
          <span>Reportar caso</span>
        </nav>

        <header className="reporte-header">
          <span>REPORTE CIUDADANO</span>
          <h1>Reportar caso</h1>
          <p>
            Tu participación ayuda a identificar situaciones que requieren
            atención. Comparte lo que observaste de forma sencilla, segura y
            confidencial.
          </p>
        </header>

        {paso > 0 && (
          <nav className="reporte-progreso" aria-label="Progreso del reporte">
            <div className="reporte-progreso-encabezado">
              <span>Paso {paso} de 3</span>
              <strong>{PASOS[paso - 1]}</strong>
            </div>

            <div className="reporte-progreso-pasos">
              {PASOS.map((etiqueta, indice) => {
                const numero = indice + 1;

                const clase =
                  numero < paso
                    ? "completado"
                    : numero === paso
                      ? "activo"
                      : "pendiente";

                return (
                  <div
                    className={`reporte-progreso-item ${clase}`}
                    key={etiqueta}
                    aria-current={numero === paso ? "step" : undefined}
                  >
                    <span className="reporte-progreso-circulo">
                      {numero < paso ? <Check size={17} /> : numero}
                    </span>
                    <span className="reporte-progreso-nombre">{etiqueta}</span>
                  </div>
                );
              })}
            </div>
          </nav>
        )}

        {paso === 0 && (
          <section className="reporte-card">
            <span className="reporte-kicker">INICIAR REPORTE</span>

            <h1>¿Cómo deseas realizar tu reporte?</h1>
            <p>
              Selecciona la modalidad que prefieras. Tu información será tratada
              con confidencialidad.
            </p>

            <div className="reporte-opciones">
              <button
                type="button"
                aria-pressed={modalidad === "ANONIMO"}
                className={modalidad === "ANONIMO" ? "seleccionado" : ""}
                onClick={() => {
                  setModalidad("ANONIMO");
                  setCorreoContacto("");
                  setErrorEnvio("");
                }}
              >
                <h2>Reporte anónimo</h2>
                <p>
                  No se solicitará correo ni se mostrará folio de seguimiento.
                </p>
              </button>

              <button
                type="button"
                aria-pressed={modalidad === "SEGUIMIENTO"}
                className={modalidad === "SEGUIMIENTO" ? "seleccionado" : ""}
                onClick={() => {
                  setModalidad("SEGUIMIENTO");
                  setErrorEnvio("");
                }}
              >
                <h2>Reporte con seguimiento</h2>
                <p>
                  Proporciona un correo y conserva tu folio para consultar
                  avances.
                </p>
              </button>
            </div>

            {modalidad === "SEGUIMIENTO" && (
              <div className="reporte-campo">
                <label htmlFor="correoContacto">Correo electrónico *</label>
                <input
                  id="correoContacto"
                  type="email"
                  value={correoContacto}
                  onChange={(e) => setCorreoContacto(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            )}

            <div className="reporte-aviso">
              Tu información está protegida y se utilizará únicamente para la
              atención del reporte.
            </div>

            {errorEnvio && (
              <p className="reporte-error" role="alert">
                {errorEnvio}
              </p>
            )}

            <div className="reporte-botones">
              <span />
              <button type="button" className="primario" onClick={siguiente}>
                Comenzar reporte
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {paso === 1 && (
          <section className="reporte-card">
            <span className="reporte-kicker">01 · INFORMACIÓN GENERAL</span>

            <h1>1. Cuéntanos lo que observaste</h1>
            <p>
              Proporciona información aproximada. No es necesario que conozcas
              datos exactos.
            </p>

            <div className="reporte-form-grid">
              <div className="reporte-campo">
                <label htmlFor="numNinos">
                  ¿Cuántos niños, niñas o adolescentes observaste? *
                </label>
                <select
                  id="numNinos"
                  value={numNinos}
                  onChange={(e) => setNumNinos(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 5 ? "5 o más" : n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="reporte-campo">
                <label htmlFor="rangoEdad">Edad aproximada *</label>
                <select
                  id="rangoEdad"
                  value={rangoEdad}
                  onChange={(e) => setRangoEdad(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="0-5">0 a 5 años</option>
                  <option value="6-11">6 a 11 años</option>
                  <option value="12-14">12 a 14 años</option>
                  <option value="15-17">15 a 17 años</option>
                  <option value="NO_ESPECIFICADO">No sé</option>
                </select>
              </div>

              <div className="reporte-campo">
                <label htmlFor="generoObservado">Género observado *</label>
                <select
                  id="generoObservado"
                  value={generoObservado}
                  onChange={(e) => setGeneroObservado(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="MIXTO">Mixto</option>
                  <option value="NO_ESPECIFICADO">No sé</option>
                </select>
              </div>

              <div className="reporte-campo">
                <label htmlFor="actividad">
                  ¿Qué actividad estaban realizando? *
                </label>
                <select
                  id="actividad"
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {actividades.map((item) => (
                    <option
                      key={item.idCatalogoActividad}
                      value={item.idCatalogoActividad}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="reporte-campo">
                <label htmlFor="horaObservada">
                  ¿A qué hora aproximada observaste la situación?
                </label>
                <input
                  id="horaObservada"
                  type="time"
                  value={horaObservada}
                  onChange={(e) => setHoraObservada(e.target.value)}
                />
              </div>

              <fieldset className="reporte-campo reporte-campo-riesgo">
                <legend>¿Observaste alguna situación de riesgo? *</legend>

                <div className="reporte-radio-opciones">
                  {[
                    { valor: "true", etiqueta: "Sí" },
                    { valor: "false", etiqueta: "No" },
                    { valor: "nose", etiqueta: "No sé" },
                  ].map((op) => (
                    <label
                      key={op.valor}
                      className={
                        situacionRiesgo === op.valor ? "seleccionado" : ""
                      }
                    >
                      <input
                        type="radio"
                        name="riesgo"
                        value={op.valor}
                        checked={situacionRiesgo === op.valor}
                        onChange={(e) => setSituacionRiesgo(e.target.value)}
                      />
                      {op.etiqueta}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="reporte-campo ancho-completo">
                <label htmlFor="descripcion">Descripción de los hechos *</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe brevemente qué viste, sin incluir datos personales de otras personas."
                  rows={5}
                />
              </div>
            </div>

            {errorEnvio && (
              <p className="reporte-error" role="alert">
                {errorEnvio}
              </p>
            )}

            <div className="reporte-botones">
              <button
                type="button"
                className="secundario"
                onClick={() => setPaso(0)}
              >
                <ArrowLeft size={17} />
                Regresar
              </button>

              <button type="button" className="primario" onClick={siguiente}>
                Continuar
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {paso === 2 && (
          <section className="reporte-card">
            <span className="reporte-kicker">02 · UBICACIÓN</span>

            <h1>2. ¿Dónde ocurrió?</h1>
            <p>
              Toca un punto en el mapa para señalar el lugar del reporte, o
              utiliza el botón de GPS si estás en el sitio.
            </p>

            <div className="reporte-mapa-encabezado">
              <strong>Ubicación del reporte</strong>
              <button type="button" className="reporte-gps" onClick={usarGPS}>
                <LocateFixed size={17} />
                Usar mi ubicación
              </button>
            </div>

            <div className="reporte-mapa-contenedor">
              <MapaUbicacion
                latitud={latitud}
                longitud={longitud}
                onSeleccionar={seleccionarUbicacion}
              />
            </div>

            {latitud !== "" && longitud !== "" && (
              <p className="reporte-coordenadas">
                <MapPin size={16} />
                Punto seleccionado: {Number(latitud).toFixed(5)},{" "}
                {Number(longitud).toFixed(5)}
              </p>
            )}

            <div className="reporte-form-grid">
              <div className="reporte-campo">
                <label htmlFor="municipio">Municipio *</label>
                <select
                  id="municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                >
                  <option value="">Selecciona un municipio</option>
                  {municipios.map((item) => (
                    <option key={item.idMunicipio} value={item.idMunicipio}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="reporte-campo">
                <label htmlFor="calle">Calle (opcional)</label>
                <input
                  id="calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Nombre de la calle"
                />
              </div>

              <div className="reporte-campo">
                <label htmlFor="colonia">Colonia (opcional)</label>
                <input
                  id="colonia"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="Nombre de la colonia"
                />
              </div>

              <div className="reporte-campo">
                <label htmlFor="cp">Código postal (opcional)</label>
                <input
                  id="cp"
                  inputMode="numeric"
                  maxLength={5}
                  value={cp}
                  onChange={(e) => setCp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ej. 52900"
                />
              </div>

              <div className="reporte-campo ancho-completo">
                <label htmlFor="referencias">Referencias del lugar</label>
                <textarea
                  id="referencias"
                  rows={3}
                  value={referencias}
                  onChange={(e) => setReferencias(e.target.value)}
                  placeholder="Ej. Frente a una escuela o junto a un parque..."
                />
              </div>
            </div>

            <div className="reporte-fotografias">
              <div className="reporte-fotos-encabezado">
                <strong>
                  Fotografías de referencia <small>(Opcional)</small>
                </strong>
                <span>
                  Fotos adjuntas {fotografias.length}/{MAX_FOTOS}
                </span>
              </div>

              <p>
                Las fotos son únicamente de referencia del lugar (fachadas,
                calles o puntos de referencia). Por respeto, dignidad y
                protección de derechos, no tomes fotos donde aparezcan personas.
              </p>

              <label
                className={`reporte-adjuntar ${
                  fotografias.length >= MAX_FOTOS ? "deshabilitado" : ""
                }`}
              >
                <Upload size={18} />
                + Adjuntar
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={fotografias.length >= MAX_FOTOS}
                  onChange={agregarFotografias}
                />
              </label>

              {fotografias.length > 0 && (
                <div className="reporte-fotos-lista">
                  {fotografias.map((archivo) => (
                    <div key={`${archivo.name}-${archivo.lastModified}`}>
                      <span>{archivo.name}</span>
                      <button
                        type="button"
                        aria-label={`Quitar ${archivo.name}`}
                        onClick={() =>
                          setFotografias((lista) =>
                            lista.filter((foto) => foto !== archivo),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorUbicacion && (
              <p className="reporte-error" role="alert">
                {errorUbicacion}
              </p>
            )}

            <div className="reporte-botones">
              <button
                type="button"
                className="secundario"
                onClick={() => setPaso(1)}
              >
                <ArrowLeft size={17} />
                Regresar
              </button>

              <button type="button" className="primario" onClick={siguiente}>
                Continuar
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {paso === 3 && (
          <section className="reporte-card">
            <span className="reporte-kicker">03 · CONFIRMACIÓN Y ENVÍO</span>

            <h1>3. Revisa y envía</h1>
            <p>
              Verifica que la información proporcionada sea correcta antes de
              enviar el reporte.
            </p>

            <div className="reporte-resumen">
              <h2>Resumen de la información</h2>

              <dl>
                {[
                  [
                    "Cantidad observada",
                    numNinos === "5" ? "5 o más" : numNinos,
                  ],
                  [
                    "Edad aproximada",
                    {
                      "0-5": "0 a 5 años",
                      "6-11": "6 a 11 años",
                      "12-14": "12 a 14 años",
                      "15-17": "15 a 17 años",
                      NO_ESPECIFICADO: "No sé",
                    }[rangoEdad],
                  ],
                  [
                    "Género observado",
                    {
                      MASCULINO: "Masculino",
                      FEMENINO: "Femenino",
                      MIXTO: "Mixto",
                      NO_ESPECIFICADO: "No sé",
                    }[generoObservado],
                  ],
                  ["Actividad realizada", nombreActividad],
                  ["Hora aproximada", horaObservada || "No especificada"],
                  ["Situación de riesgo", riesgoTexto],
                  ["Breve descripción de lo visto", descripcion],
                  [
                    "Ubicación",
                    `${nombreMunicipio}${calle ? `, ${calle}` : ""}${
                      colonia ? `, ${colonia}` : ""
                    }${referencias ? `. Referencias: ${referencias}` : ""}`,
                  ],
                  [
                    "Fotografías adjuntas",
                    fotografias.length
                      ? fotografias.map((foto) => foto.name).join(", ")
                      : "Ninguna",
                  ],
                  [
                    "Modalidad",
                    modalidad === "ANONIMO" ? "Anónimo" : "Con seguimiento",
                  ],
                ].map(([clave, valor]) => (
                  <div key={clave}>
                    <dt>{clave}</dt>
                    <dd>{valor || "No especificado"}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <label className="reporte-checkbox">
              <input
                type="checkbox"
                checked={aceptoAviso}
                onChange={(e) => setAceptoAviso(e.target.checked)}
              />
              <span>
                Acepto el aviso de privacidad y autorizo el envío de la
                información proporcionada.
              </span>
            </label>

            {errorEnvio && (
              <p className="reporte-error" role="alert">
                {errorEnvio}
              </p>
            )}

            <div className="reporte-botones">
              <button
                type="button"
                className="secundario"
                disabled={enviando || !!folioRegistrado}
                onClick={() => setPaso(2)}
              >
                <ArrowLeft size={17} />
                Regresar
              </button>

              <button
                type="button"
                className="primario"
                disabled={!aceptoAviso || enviando}
                onClick={enviarReporte}
              >
                {enviando
                  ? "Enviando..."
                  : folioRegistrado
                    ? "Reintentar fotografías"
                    : "Enviar reporte"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
