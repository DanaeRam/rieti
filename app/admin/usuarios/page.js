/**
 * Administración de usuarios alimentadores de RIETI.
 * Permite consultar, crear, editar y cambiar el estado de las cuentas.
 *
 * @module app/admin/usuarios/page
 */
"use client";

import { useEffect, useState } from "react";

/**
 * Permite gestionar las cuentas de usuarios alimentadores.
 *
 * @component
 */
export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [correoInstitucional, setCorreoInstitucional] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [idMunicipio, setIdMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);

  const [usuarios, setUsuarios] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [usuarioCreado, setUsuarioCreado] = useState(null);
  const [credencialesVisibles, setCredencialesVisibles] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState("");

  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editMunicipio, setEditMunicipio] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [usuarioEstado, setUsuarioEstado] = useState(null);
  const [accionEstado, setAccionEstado] = useState("");
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    /** Carga el catálogo de municipios para los formularios de usuario. */
    /** Carga los municipios disponibles para los formularios de usuario. */
    async function cargarMunicipios() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/municipios",
        );

        const datos = await respuesta.json();

        setMunicipios(datos);
      } catch {
        setMunicipios([]);
      }
    }

    cargarMunicipios();
  }, []);

  /**
   * Obtiene del servidor el listado actualizado de usuarios.
   */
  async function cargarUsuarios() {
    setCargandoUsuarios(true);
    setErrorUsuarios("");

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/usuarios?idRol=2",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message ||
            datos.error ||
            "No se pudieron cargar los alimentadores",
        );
      }

      setUsuarios(datos.usuarios || []);
      setTotalUsuarios(datos.total || 0);
    } catch (error) {
      console.error("Error al cargar alimentadores:", error);

      setErrorUsuarios(
        error.message || "No se pudieron cargar los alimentadores",
      );
    } finally {
      setCargandoUsuarios(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  /**
   * Crea una cuenta de usuario con los datos ingresados en el formulario.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
  async function crearUsuario(event) {
    event.preventDefault();

    setMensaje("");
    setTipoMensaje("");
    setCargando(true);

    try {
      const token = localStorage.getItem("token");

      const datosUsuario = {
        nombre,
        correo_institucional: correoInstitucional,
        telefono,
        password,
        idRol: 2,
        idMunicipio: Number(idMunicipio),
      };

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosUsuario),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message ||
            datos.error ||
            JSON.stringify(datos) ||
            "No se pudo crear el usuario",
        );
      }

      setUsuarioCreado({
        nombre,
        correo: correoInstitucional,
        password,
      });

      setCredencialesVisibles(false);
      setCopiado(false);

      setNombre("");
      setCorreoInstitucional("");
      setTelefono("");
      setPassword("");
      setIdMunicipio("");

      await cargarUsuarios();
    } catch (error) {
      console.error("Error al crear alimentador:", error);

      setMensaje(error.message || "No se pudo crear el alimentador.");

      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  /** Copia la contraseña temporal del usuario recién creado. */
  async function copiarPassword() {
    if (!usuarioCreado) return;

    try {
      await navigator.clipboard.writeText(usuarioCreado.password);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  /** Cierra el mensaje con los datos del usuario creado. */
  function cerrarUsuarioCreado() {
    setUsuarioCreado(null);
    setCredencialesVisibles(false);
    setCopiado(false);
  }

  /**
   * Abre el formulario de edición y carga los datos del usuario seleccionado.
   *
   * @param {Object} usuario - Usuario que se va a editar.
   */
  function abrirEditar(usuario) {
    setUsuarioEditar(usuario);

    setEditNombre(usuario.nombre || "");
    setEditTelefono(usuario.telefono || "");
    setEditMunicipio(String(usuario.idMunicipio || ""));
  }

  /**
   * Cierra el formulario de edición y limpia sus valores.
   */
  function cerrarEditar() {
    setUsuarioEditar(null);
    setEditNombre("");
    setEditTelefono("");
    setEditMunicipio("");
  }

  /**
   * Guarda en el servidor los cambios del usuario seleccionado.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
  async function guardarEdicion(event) {
    event.preventDefault();

    if (!usuarioEditar) {
      return;
    }

    setGuardandoEdicion(true);

    try {
      const token = localStorage.getItem("token");

      const datosActualizados = {
        nombre: editNombre,
        telefono: editTelefono,
        idMunicipio: Number(editMunicipio),
      };

      const respuesta = await fetch(
        `https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/usuarios/${usuarioEditar.idUsuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosActualizados),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message ||
            datos.error ||
            "No se pudo actualizar el alimentador",
        );
      }

      setMensaje("El alimentador fue actualizado correctamente.");
      setTipoMensaje("success");

      cerrarEditar();

      await cargarUsuarios();
    } catch (error) {
      console.error("Error al editar alimentador:", error);

      setMensaje(error.message || "No se pudo actualizar el alimentador.");

      setTipoMensaje("error");
    } finally {
      setGuardandoEdicion(false);
    }
  }

  /**
   * Prepara la acción de activar o desactivar al usuario seleccionado.
   *
   * @param {Object} usuario - Usuario cuyo estado se cambiará.
   */
  function abrirCambioEstado(usuario) {
    setUsuarioEstado(usuario);

    if (usuario.activo === 1) {
      setAccionEstado("desactivar");
    } else {
      setAccionEstado("activar");
    }
  }

  /**
   * Cierra la confirmación de cambio de estado.
   */
  function cerrarCambioEstado() {
    setUsuarioEstado(null);
    setAccionEstado("");
  }

  /**
   * Actualiza el estado activo de la cuenta seleccionada.
   */
  async function cambiarEstado() {
    if (!usuarioEstado) {
      return;
    }
    setCambiandoEstado(true);

    const nuevoEstado = accionEstado === "activar";

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/usuarios/${usuarioEstado.idUsuario}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            activo: nuevoEstado,
          }),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message ||
            datos.error ||
            "No se pudo cambiar el estado del alimentador",
        );
      }

      if (nuevoEstado) {
        setMensaje("El alimentador fue activado correctamente.");
      } else {
        setMensaje("El alimentador fue desactivado correctamente.");
      }

      setTipoMensaje("success");
      cerrarCambioEstado();

      await cargarUsuarios();
    } catch (error) {
      console.error("Error al cambiar estado:", error);

      setMensaje(
        error.message || "No se pudo cambiar el estado del alimentador.",
      );

      setTipoMensaje("error");
    } finally {
      setCambiandoEstado(false);
    }
  }

  return (
    <>
      <div className="reportes-page usuarios-page">
        <div className="rieti-page-title">
          <h2>Administración de usuarios</h2>
        </div>

        <section className="rieti-panel">
          <div className="rieti-panel-header">
            <div>
              <span>NUEVO ALIMENTADOR</span>
              <h3>Crear alimentador</h3>
            </div>
          </div>

          <form onSubmit={crearUsuario} className="usuarios-form">
            <div className="usuario-filtro">
              <label htmlFor="nombre">Nombre</label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="usuario-filtro">
              <label htmlFor="correoInstitucional">Correo institucional</label>

              <input
                id="correoInstitucional"
                type="email"
                value={correoInstitucional}
                onChange={(e) => setCorreoInstitucional(e.target.value)}
                required
              />
            </div>

            <div className="usuario-filtro">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="usuario-filtro">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="usuario-filtro">
              <label htmlFor="idMunicipio">Municipio</label>
              <select
                id="idMunicipio"
                value={idMunicipio}
                onChange={(e) => setIdMunicipio(e.target.value)}
                required
              >
                <option value="">Seleccionar municipio</option>

                {municipios.map((municipio) => (
                  <option
                    key={municipio.idMunicipio}
                    value={municipio.idMunicipio}
                  >
                    {municipio.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="usuarios-form-actions">
              <button
                type="submit"
                className="usuarios-button"
                disabled={cargando}
              >
                {cargando ? "Cargando..." : "Crear alimentador"}
              </button>
            </div>

            {mensaje && (
              <div className={`usuarios-mensaje ${tipoMensaje}`}>{mensaje}</div>
            )}
          </form>
        </section>

        <section className="rieti-panel">
          <div className="rieti-panel-header usuarios-list-header">
            <div>
              <span>USUARIOS</span>
              <h3>Alimentadores registrados</h3>
            </div>

            <span className="reportes-count">
              {totalUsuarios} alimentadores
            </span>
          </div>

          <div className="reportes-table-container usuarios-table-container">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Municipio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargandoUsuarios && (
                  <tr>
                    <td colSpan="6">Cargando alimentadores...</td>
                  </tr>
                )}

                {!cargandoUsuarios && errorUsuarios && (
                  <tr>
                    <td colSpan="6">{errorUsuarios}</td>
                  </tr>
                )}

                {!cargandoUsuarios &&
                  !errorUsuarios &&
                  usuarios.length === 0 && (
                    <tr>
                      <td colSpan="6">No hay alimentadores registrados.</td>
                    </tr>
                  )}

                {!cargandoUsuarios &&
                  !errorUsuarios &&
                  usuarios.map((usuario) => (
                    <tr key={usuario.idUsuario}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.correo_institucional}</td>
                      <td>{usuario.telefono || "—"}</td>
                      <td>{usuario.municipio}</td>
                      <td>
                        <span
                          className={`usuario-estado ${
                            usuario.activo === 1 ? "activo" : "inactivo"
                          }`}
                        >
                          <span className="usuario-estado-punto"></span>
                          {usuario.activo === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <div>
                          <button
                            type="button"
                            onClick={() => abrirEditar(usuario)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirCambioEstado(usuario)}
                          >
                            {usuario.activo === 1 ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {usuarioEditar && (
        <div className="usuarios-modal-overlay">
          <div className="usuarios-modal">
            <div className="usuarios-modal-header">
              <div>
                <span>EDITAR USUARIO</span>
                <h2>Editar alimentador</h2>
              </div>

              <button
                type="button"
                className="usuarios-modal-close"
                onClick={cerrarEditar}
              >
                ×
              </button>
            </div>

            <div className="usuarios-modal-content">
              <p>Correo institucional: {usuarioEditar.correo_institucional}</p>

              <form onSubmit={guardarEdicion}>
                <div>
                  <label htmlFor="editNombre">Nombre</label>

                  <input
                    id="editNombre"
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editTelefono">Teléfono</label>

                  <input
                    id="editTelefono"
                    type="tel"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="editMunicipio">Municipio</label>

                  <select
                    id="editMunicipio"
                    value={editMunicipio}
                    onChange={(e) => setEditMunicipio(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar municipio</option>

                    {municipios.map((municipio) => (
                      <option
                        key={municipio.idMunicipio}
                        value={municipio.idMunicipio}
                      >
                        {municipio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="usuarios-modal-actions">
                  <button
                    type="button"
                    className="usuarios-modal-button secondary"
                    onClick={cerrarEditar}
                    disabled={guardandoEdicion}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="usuarios-modal-button primary"
                    disabled={guardandoEdicion}
                  >
                    {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {usuarioEstado && (
        <div className="usuarios-modal-overlay">
          <div className="usuarios-confirmacion">
            <div className="usuarios-confirmacion-header">
              <span>CAMBIO DE ESTADO</span>

              <h2>
                {accionEstado === "desactivar"
                  ? "¿Desactivar alimentador?"
                  : "¿Activar alimentador?"}
              </h2>
            </div>

            <p className="usuarios-confirmacion-nombre">
              {usuarioEstado.nombre}
            </p>

            <p className="usuarios-confirmacion-texto">
              {accionEstado === "desactivar"
                ? `${usuarioEstado.nombre} dejará de tener acceso al sistema.`
                : `${usuarioEstado.nombre} podrá volver a iniciar sesión en RIETI.`}
            </p>

            <div className="usuarios-modal-actions">
              <button
                type="button"
                className="usuarios-modal-button secondary"
                onClick={cerrarCambioEstado}
                disabled={cambiandoEstado}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`usuarios-modal-button ${
                  accionEstado === "desactivar" ? "danger" : "success"
                }`}
                onClick={cambiarEstado}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado
                  ? "Procesando..."
                  : accionEstado === "desactivar"
                    ? "Desactivar"
                    : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioCreado && (
        <div className="usuarios-modal-overlay">
          <div
            className="usuarios-confirmacion usuarios-creado"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuario-creado-titulo"
          >
            <div className="usuarios-confirmacion-header">
              <span>CUENTA CREADA</span>
              <h2 id="usuario-creado-titulo">
                Alimentador creado correctamente
              </h2>
            </div>

            <p className="usuarios-confirmacion-texto">
              Guarda las credenciales y compártelas de forma segura con el
              funcionario.
            </p>

            <div className="usuarios-creado-datos">
              <div>
                <label>Nombre completo</label>
                <strong>{usuarioCreado.nombre}</strong>
              </div>

              <div>
                <label>Correo institucional</label>
                <strong>{usuarioCreado.correo}</strong>
              </div>

              <div>
                <label>Contraseña temporal</label>

                <div className="usuarios-creado-password">
                  <strong>
                    {credencialesVisibles ? usuarioCreado.password : "••••••••"}
                  </strong>

                  <button
                    type="button"
                    onClick={() => setCredencialesVisibles((actual) => !actual)}
                  >
                    {credencialesVisibles ? "Ocultar" : "Mostrar"}
                  </button>

                  <button type="button" onClick={copiarPassword}>
                    {copiado ? "Copiada" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <p className="usuarios-creado-aviso">
              Estas credenciales dejarán de mostrarse al cerrar la ventana. No
              compartas la contraseña por canales inseguros.
            </p>

            <div className="usuarios-modal-actions">
              <button
                type="button"
                className="usuarios-modal-button primary"
                onClick={cerrarUsuarioCreado}
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
