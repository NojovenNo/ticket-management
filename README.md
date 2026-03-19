# Ticket Management System

Proyecto full stack para gestionar tickets de soporte con autenticación JWT y control de acceso por roles (`Admin` y `User`).

## Contexto del proyecto

- `frontend/`: aplicación web en Next.js (App Router) con TypeScript y componentes de `shadcn/ui`.
- `backend/`: API REST en ASP.NET Core + Entity Framework Core + SQL Server.
- `backend/Crear_DB.sql`: script para crear base de datos y tablas (`Usuarios`, `Tickets`).

## Instrucciones para ejecutar el proyecto

### 1) Prerrequisitos

- Node.js 20+
- npm 10+
- .NET SDK 10 (según `TargetFramework: net10.0`)
- SQL Server LocalDB o SQL Server Express
- (Opcional recomendado) SQL Server Management Studio para ejecutar el script SQL

### 2) Clonar e instalar dependencias

```bash
git clone <URL_DEL_REPO>
cd ticket-management
cd frontend
npm install
```

### 3) Preparar base de datos

1. Abrir `backend/Crear_DB.sql` en SSMS.
2. Ejecutar el script completo.
3. Verificar que existan:
  - Base de datos `TicketDB`
  - Tabla `Usuarios`
  - Tabla `Tickets`

> El backend usa por defecto la cadena:
> `Server=(localdb)\\MSSQLLocalDB;Database=TicketDB;Trusted_Connection=True;`

Si tu instancia es distinta, ajusta `backend/TicketMasterAPI/appsettings.json`.

### 4) Levantar backend

```bash
cd backend/TicketMasterAPI
dotnet restore
dotnet run
```

Endpoints principales:

- API base: `http://localhost:5227`
- Swagger UI: `http://localhost:5227/swagger`

### 5) Configurar frontend

El archivo `frontend/.env` debe apuntar al backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5227
```

### 6) Levantar frontend

```bash
cd frontend
npm run dev
```

Abrir: `http://localhost:3000`

### 7) Flujo de prueba rápido

1. Registrar usuario en `/register` (puedes elegir `User` o `Admin`).
2. Iniciar sesión en `/login`.
3. Crear tickets desde el dashboard.
4. Si el usuario es `Admin`, podrá cerrar tickets.

## Endpoints principales de la API

- `POST /register` - Registro
- `POST /login` - Login
- `GET /tickets` - Listado (según rol)
- `POST /tickets` - Crear ticket
- `PATCH /tickets/{id}/close` - Cerrar ticket (solo admin)

## Estructura del repositorio

```text
ticket-management/
|- backend/
|  |- Crear_DB.sql
|  |- TicketMasterAPI/
|     |- Controllers/
|     |- Data/
|     |- Dtos/
|     |- Models/
|     |- Services/
|- frontend/
|  |- app/
|  |- components/
|  |- lib/
```

## Decisiones técnicas tomadas

### 1) Arquitectura Frontend: Next.js + Tailwind CSS

- **Framework**: Se utilizó **Next.js 15 (App Router)** para estructurar el portal web de manera eficiente, facilitando el manejo de rutas protegidas y el consumo de la API.
- **Estilos**: Uso de **Tailwind CSS** para un diseño moderno y responsivo, permitiendo una personalización rápida de la interfaz.
- **Estado Global**: Implementación de un **AuthContext** con Context API para gestionar de forma centralizada la sesión del usuario, el JWT y la información del perfil (email y rol).

### 2) Visualización de Datos: Gráfico Circular Dinámico

- **Implementación**: Se integró **Recharts** para cumplir con el requerimiento obligatorio de visualización.
- **Lógica**: El gráfico consume los datos reales obtenidos del endpoint `/tickets`. Realiza una agregación dinámica de los estados `Open` y `Closed` para reflejar en tiempo real la proporción de tickets en el sistema.

### 3) Backend Robusto: ASP.NET Core + EF Core

- **Estructura**: API REST construida con Controladores desacoplados, utilizando DTOs para la transferencia de datos segura entre cliente y servidor.
- **Persistencia**: Uso de **Entity Framework Core** para el manejo de la base de datos relacional (SQL Server). Se establecieron las relaciones uno-a-muchos entre `Usuario` y `Ticket` según lo especificado.
- **Seguridad**: Implementación de un servicio de **Hashing** para contraseñas, asegurando que la información sensible nunca se almacene en texto plano.

### 4) Autenticación y Autorización (JWT + Roles)

- **Token**: Implementación de **JWT Bearer Authentication**. El token contiene los *claims* necesarios para identificar al usuario y su rol.
- **RBAC**: Control de acceso basado en roles configurado en los endpoints.
  - `User`: Filtro en la base de datos para que el usuario solo acceda a sus tickets.
  - `Admin`: Acceso total a los tickets y exclusividad para el endpoint `PATCH /tickets/{id}/close`.

## Qué mejoraría con más tiempo

1. **Migraciones de Entity Framework**: Implementar el flujo de *Code-First Migrations* para automatizar el control de versiones de la base de datos y eliminar la dependencia del script SQL manual.
2. **Validaciones de Entrada**: Incorporar una validación de modelos más robusta en el backend para manejar errores de formato de datos antes de procesar la lógica de negocio.
3. **Pruebas Automatizadas**: Crear una suite de pruebas unitarias para los controladores de la API y pruebas de integración para el flujo de autenticación.
4. **Sistema de Notificaciones (Toasts)**: Mejorar la experiencia de usuario agregando feedback visual inmediato (alertas o notificaciones flotantes) al realizar acciones como login, creación o cierre de tickets.
5. **Optimización de Consultas**: Implementar paginación y búsqueda en el listado de tickets para mejorar el rendimiento en entornos con gran volumen de datos.
