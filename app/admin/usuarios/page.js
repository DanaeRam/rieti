"use client";

import { useState } from "react";

export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("");
  const [municipio, setMunicipio] = useState("");

  function crearUsuario(event) {
    event.preventDefault();
  }

  return (
    <>
      <div>
        <h2>Administración de usuarios</h2>
      </div>

      <section>
        <div>
          <div>
            <span>NUEVO USUARIO</span>
            <h3>Crear funcionario</h3>
          </div>
        </div>

        <form onSubmit={crearUsuario}>
          <div>
            <label htmlFor="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="correo">Correo institucional</label>

            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="contrasena">Contraseña</label>

            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="rol">Rol</label>

            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="alimentador">Alimentador</option>
            </select>
          </div>

          <div>
            <label htmlFor="municipio">Municipio</label>

            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              required
            >
              <option value="">Seleccionar municipio</option>
            </select>
          </div>

          <button type="submit">Crear usuario</button>
        </form>
      </section>

      <section>
        <div>
          <span>USUARIOS</span>
          <h3>Usuarios registrados</h3>
        </div>

        <div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Municipie</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody></tbody>
          </table>
        </div>
      </section>
    </>
  );
}
