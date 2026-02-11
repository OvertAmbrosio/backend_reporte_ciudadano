# Citizen Report Backend

Backend para la aplicación de reportes ciudadanos, construido con **NestJS**, **MySQL** y **TypeORM**.

## 📋 Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (para la base de datos)

## 🚀 Paso a Paso para Levantar el Proyecto

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y copia el siguiente contenido:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=citizen_report

# Servidor
PORT=3000

# Seguridad (JWT)
JWT_SECRET=ClaveSecretaSuperSegura123!
```

### 3. Levantar la Base de Datos (Docker)
Asegúrate de que Docker Desktop esté corriendo y ejecuta:

```bash
docker-compose up -d
```
Esto levantará un contenedor MySQL con la configuración definida en `docker-compose.yml`.

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Ejecutar la Aplicación
Inicia el servidor en modo desarrollo:

```bash
npm run start:dev
```
La aplicación iniciará en `http://localhost:3000`.

> **Nota:** Al iniciar por primera vez, las tablas se crearán automáticamente (synchronize: true) y se ejecutará un **Seed** para crear el usuario administrador.

## 👤 Acceso Administrador (Seed)

Al iniciar la app, se crea automáticamente el siguiente usuario si no existe:

- **Email:** `admin@citizenreport.com`
- **Contraseña:** `AdminPassword123!`

Usa estas credenciales para obtener un Token JWT en el endpoint de Login y acceder a las funciones administrativas.

## 🔗 Endpoints Principales

### Autenticación
- `POST /auth/login`: Iniciar sesión (Devuelve Access Token).
- `POST /auth/register`: Registrar nuevo usuario ciudadano.

### Reportes
- `GET /reports`: Listar todos los reportes (Soporta filtros: `?status=PENDING`, `?userId=1`).
- `POST /reports`: Crear reporte (Requiere imagen en Base64 y ubicación).
- `GET /reports/user`: Ver mis reportes.
- `PATCH /reports/:id/status`: Cambiar estado de reporte (Solo Admin).
- `POST /reports/:id/comment`: Agregar comentario administrativo (Solo Admin).

### Usuarios
- `GET /users/profile`: Ver mi perfil.
- `PATCH /users/:id`: Actualizar mis datos.
