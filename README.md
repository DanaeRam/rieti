# RIETI Web

Aplicación web del sistema **RIETI (Ruta Intermunicipal para la Erradicación del Trabajo Infantil)**, desarrollada con Next.js y React.

La plataforma permite registrar posibles casos de trabajo infantil, consultar el seguimiento de reportes y administrar los casos recibidos mediante un panel para funcionarios autorizados.

El sistema cuenta con dos áreas principales:

- **Portal ciudadano:** permite registrar reportes anónimos o con seguimiento, indicar la ubicación del incidente y adjuntar evidencias fotográficas opcionales.
- **Panel administrativo:** permite consultar expedientes, registrar actuaciones, actualizar estatus, asignar responsables, administrar usuarios y visualizar estadísticas.

La aplicación se comunica con el backend de RIETI mediante una API REST y se encuentra publicada en Vercel.

**Aplicación web:** https://rieti.vercel.app

**Repositorio:** https://github.com/DanaeRam/rieti

---

## Tecnologías utilizadas

El proyecto está desarrollado principalmente con:

- JavaScript
- JSX
- Next.js 16
- React 19
- CSS
- Node.js
- npm

### Librerías y dependencias principales

| Librería | Función |
|---|---|
| `next` | Framework principal de la aplicación. |
| `react` y `react-dom` | Construcción de interfaces y componentes. |
| `lucide-react` | Iconos del sistema. |
| `apexcharts` | Gráficas estadísticas. |
| `react-apexcharts` | Integración de ApexCharts con React. |
| `leaflet` | Visualización de mapas interactivos. |
| `react-leaflet` | Integración de Leaflet con React. |
| `leaflet.heat` | Visualización de mapas de calor. |
| `@linkurious/leaflet-heat` | Funcionalidades adicionales de mapas de calor. |
| `leaflet.markercluster` | Agrupación de marcadores en mapas. |
| `@turf/boolean-point-in-polygon` | Comprobación de puntos dentro de polígonos geográficos. |
| `gsap` | Animaciones de elementos de la interfaz. |
| `tailwindcss` | Herramientas de estilos. |
| `eslint` | Análisis y revisión del código. |

Las versiones específicas se encuentran en los archivos `package.json` y `package-lock.json`.

---

# Arquitectura general

La aplicación utiliza una arquitectura basada en componentes React y el sistema de rutas **App Router** de Next.js.

El frontend se encarga de presentar las interfaces, capturar información del usuario y comunicarse con los servicios del backend.

```text
                 USUARIOS
                    |
          +---------+---------+
          |                   |
          v                   v
   Portal ciudadano     Panel administrativo
          |                   |
          +---------+---------+
                    |
                    v
              RIETI Web
            Next.js + React
                    |
                  HTTPS
                    |
                    v
              API REST RIETI
             Node.js + Express
                    |
             +------+------+
             |             |
             v             v
         Amazon RDS     Amazon S3
           MySQL        Evidencias
```

La aplicación web no se conecta directamente a la base de datos MySQL.

Las operaciones de registro, consulta y administración se realizan mediante solicitudes HTTP a los endpoints del backend.

El backend administra el acceso a Amazon RDS para almacenar información estructurada y a Amazon S3 para gestionar evidencias fotográficas.

---

# Organización del repositorio

La estructura principal del proyecto es la siguiente:

```text
rieti/
│
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   ├── estadisticas/
│   │   │   └── page.js
│   │   ├── reportes/
│   │   ├── usuarios/
│   │   └── layout.js
│   │
│   ├── login/
│   │   └── page.js
│   ├── reporte/
│   │   └── page.js
│   ├── seguimiento/
│   │   └── page.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│   ├── dashboard/
│   ├── estadisticas/
│   │
│   ├── AsignacionReporte.js
│   ├── Bitacora.js
│   ├── DatosRieti.js
│   ├── ExpedienteDigital.js
│   ├── Header.js
│   ├── HistorialEstatus.js
│   ├── LimitesMunicipales.js
│   ├── MapaCalor.js
│   ├── MapaExpediente.js
│   ├── MapaMunicipios.js
│   ├── MapaPuntos.js
│   ├── MapaUbicacion.js
│   ├── MapaUbicacionLeaflet.js
│   ├── Perfil.js
│   └── Sidebar.js
│
├── public/
│
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── README.md
```

Los directorios internos se presentan de forma resumida para facilitar la lectura.

---

# Integración con el backend

RIETI Web consume una API REST desarrollada con Node.js y Express, desplegada mediante AWS Lambda.

La aplicación utiliza principalmente la función `fetch()` de JavaScript para realizar solicitudes HTTP.

## URL base

```text
https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1
```

## Endpoints principales

| Método | Endpoint | Función |
|---|---|---|
| GET | `/municipios` | Consultar municipios. |
| GET | `/catalogos/actividades` | Consultar actividades. |
| POST | `/reportes` | Registrar un reporte. |
| GET | `/reportes/{folio}` | Consultar seguimiento. |
| POST | `/auth/login` | Iniciar sesión administrativa. |
| GET | `/auth/me` | Consultar usuario autenticado. |
| POST | `/auth/password` | Cambiar contraseña. |
| GET | `/admin/dashboard/resumen` | Consultar indicadores. |
| GET | `/admin/dashboard/estadisticas` | Consultar estadísticas. |
| GET | `/admin/reportes` | Consultar reportes. |
| GET | `/admin/reportes/{folio}/expediente` | Consultar expediente. |
| POST | `/admin/atencion` | Registrar actuaciones. |
| POST | `/admin/asignaciones` | Asignar responsables. |
| GET | `/admin/usuarios` | Consultar usuarios. |
| POST | `/admin/usuarios` | Crear usuarios. |

La tabla reúne los principales servicios documentados en la API de RIETI. Para conocer todos los parámetros, estructuras JSON y respuestas, se debe consultar la documentación técnica del backend.

---


## Almacenamiento de evidencias fotográficas

Las fotografías de referencia se almacenan mediante Amazon S3.

El backend proporciona URLs temporales para permitir la carga y consulta autorizada de los archivos.

El flujo general es el siguiente:

```text
Usuario selecciona fotografía
             |
             v
      RIETI Web
             |
             v
Solicita URL temporal a la API
             |
             v
      API REST RIETI
             |
             v
     URL prefirmada S3
             |
             v
   Carga de la fotografía
             |
             v
        Amazon S3
             |
             v
 Confirmación mediante la API
```

---

# Instalación y ejecución local

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Git.
- Node.js compatible con Next.js 16.
- npm.
- Visual Studio Code u otro editor de código.
- Conexión a Internet para instalar dependencias y consumir la API.

Se recomienda utilizar Node.js 20.9 o superior.

## 1. Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/DanaeRam/rieti.git
```


## 2. Entrar al proyecto

```bash
cd rieti
```

## 3. Instalar dependencias

```bash
npm ci
```

Este comando instala las dependencias utilizando las versiones registradas en `package-lock.json`.

## 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

## 5. Abrir la aplicación

Ingresa desde el navegador a:

```text
http://localhost:3000
```

La aplicación se ejecutará en modo desarrollo y permitirá visualizar los cambios realizados en el código.

**Nota:** La ejecución local del frontend no inicia automáticamente el backend. Para utilizar las funciones conectadas, la API de RIETI debe encontrarse disponible y permitir las solicitudes desde el origen local.

---

# Compilación para producción

Para generar una versión optimizada de la aplicación:

```bash
npm run build
```

Una vez finalizada la compilación, puede iniciarse el servidor de producción mediante:

```bash
npm run start
```

También es posible revisar el código mediante ESLint:

```bash
npm run lint
```

---

# Despliegue

La aplicación web se encuentra publicada en Vercel:

https://rieti.vercel.app

Para realizar un nuevo despliegue se puede importar el repositorio de GitHub desde Vercel, seleccionar el framework Next.js y configurar las opciones necesarias.

En caso de conectar el proyecto a una rama de producción, Vercel permite realizar despliegues automáticos cuando se envían cambios al repositorio, según la configuración del proyecto.

---

# Solución de problemas comunes

| Problema | Posible solución |
|---|---|
| No se reconoce el comando `npm`. | Verificar que Node.js y npm estén instalados. |
| Faltan dependencias. | Ejecutar `npm ci` dentro de la carpeta del proyecto. |
| El puerto 3000 está ocupado. | Utilizar otro puerto o cerrar el proceso que lo ocupa. |
| No se cargan los reportes. | Revisar la disponibilidad de la API y las solicitudes en Network. |
| Error 401. | Verificar las credenciales o iniciar sesión nuevamente. |
| Error 403. | Revisar los permisos del usuario. |
| No se muestran los mapas. | Comprobar los recursos cartográficos y los errores en la consola. |
| No se cargan las fotografías. | Revisar las solicitudes a los endpoints de evidencias. |
| Error de compilación. | Ejecutar `npm run build` y revisar los mensajes de la terminal. |

---


# Autoría

**Desarrollo web:** Danae Ramírez

**Proyecto:** RIETI — Ruta Intermunicipal para la Erradicación del Trabajo Infantil.

Algunas funcionalidades y componentes fueron desarrollados con apoyo de ChatGPT (OpenAI). La atribución específica se incluye en los comentarios del código fuente cuando corresponde.

