# Microservicio de Usuarios y Autenticacion

Microservicio independiente para registro, autenticacion y consulta de usuarios.
La API se ejecutara localmente en `http://localhost:3001` y usara PostgreSQL en la
base de datos `auth_db`.

## Estructura propuesta

```text
Microservicio Usuarios/
|-- src/
|   |-- app.js                 # Configuracion de Express
|   |-- server.js              # Arranque del proceso HTTP
|   |-- config/
|   |   `-- database.js        # Pool de PostgreSQL
|   |-- middlewares/
|   |   |-- auth.middleware.js # Validacion del JWT
|   |   `-- role.middleware.js # Autorizacion por rol
|   |-- routes/
|   |   |-- auth.routes.js
|   |   `-- users.routes.js
|   |-- controllers/
|   |   |-- auth.controller.js
|   |   `-- users.controller.js
|   |-- services/
|   |   |-- auth.service.js    # bcrypt y JWT
|   |   `-- users.service.js
|   |-- repositories/
|   |   `-- users.repository.js
|   `-- validators/
|       `-- users.validator.js
|-- tests/
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
`-- readme.md
```

La API no debe compartir codigo ni acceso directo a la base de datos con los otros
microservicios. Los demas servicios consumiran unicamente sus endpoints o, en una
etapa posterior, validaran el JWT con el mismo contrato de claims.

## Variables de entorno

Copiar `.env.example` como `.env` y reemplazar localmente la contrasena de
PostgreSQL y el secreto JWT de ejemplo. El archivo `.env` contiene configuracion
local y no debe subirse al repositorio.

```text
PORT=3001
DATABASE_URL=postgresql://postgres:tu_contrasena@localhost:5432/auth_db
JWT_SECRET=cambia_este_secreto_en_tu_entorno
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=12
```

## Endpoints

| Metodo | Ruta | Acceso | Funcion |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Publico | Crear un usuario y devolver sus datos publicos |
| `POST` | `/api/auth/login` | Publico | Validar credenciales y devolver un JWT |
| `GET` | `/api/users` | JWT + `admin` | Listar usuarios, sin contrasenas |
| `GET` | `/api/users/:id` | JWT | Obtener un usuario por ID |
| `GET` | `/api/health` | Publico | Comprobar disponibilidad del servicio y base de datos |

### Registro

`POST /api/auth/register`

```json
{
	"name": "Ana Perez",
	"email": "ana@example.com",
	"password": "Password123!"
}
```

Respuesta `201`:

```json
{
	"id": 1,
	"name": "Ana Perez",
	"email": "ana@example.com",
	"roles": ["user"],
	"createdAt": "2026-08-31T12:00:00.000Z"
}
```

El email se normaliza a minusculas. La contrasena se almacena unicamente como
hash bcrypt y nunca aparece en una respuesta.

### Login

`POST /api/auth/login` recibe `email` y `password` y responde `200`:

```json
{
	"token": "<jwt>",
	"expiresIn": "1h",
	"user": {
		"id": 1,
		"name": "Ana Perez",
		"email": "ana@example.com",
		"roles": ["user"]
	}
}
```

Los endpoints protegidos reciben `Authorization: Bearer <jwt>`. El token debe
contener `sub` con el ID del usuario, `email`, `roles`, `iat` y `exp`.

## Reglas iniciales

- Roles iniciales: `admin` y `user`; el registro publico solo asigna `user`.
- Solo un administrador puede listar todos los usuarios.
- Un usuario autenticado puede consultar su propio ID; `admin` puede consultar cualquiera.
- Errores: `400` validacion, `401` falta o invalidez del token, `403` permisos,
	`404` recurso inexistente y `409` email duplicado.
