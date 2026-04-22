# StreamFútbol

Prototipo de plataforma web de streaming deportivo desarrollado como TFG del Grado en Ingeniería del Software (mención en Ciberseguridad) en la U-tad.

El proyecto propone un sistema de control de acceso basado en la identidad digital del usuario como alternativa al bloqueo tradicional por IP, y añade sobre esa base un mecanismo activo de detección de comportamiento anómalo capaz de identificar y bloquear automáticamente el uso compartido de credenciales.

La memoria completa del trabajo, con la justificación técnica de las decisiones, el estado de la cuestión y las pruebas de validación, se entrega junto a este código fuente.

## Stack tecnológico

- **Next.js 16** (App Router, React Server Components, API Routes).
- **React 19** con **Tailwind CSS 4** en el frontend.
- **MongoDB Atlas** con **Mongoose** como capa ODM.
- **JSON Web Tokens** (`jsonwebtoken`) para la autenticación basada en identidad.
- **bcryptjs** para el hashing de contraseñas con factor de coste 10.
- **hls.js** para la reproducción de streams HLS en navegadores sin soporte nativo.
- **ip-api.com** como servicio de geolocalización por IP en el sistema de detección de anomalías.

## Requisitos previos

- Node.js 20 o superior.
- Una cuenta de MongoDB Atlas con un cluster accesible (el plan gratuito es suficiente).
- Acceso a internet durante la ejecución (para la consulta de geolocalización).

## Instalación

Clonar el repositorio y entrar en el directorio del backend, que contiene el proyecto fullstack Next.js:

```bash
git clone <url-del-repositorio>
cd TFG_GonzaloMontero/tfg-antipirateria/backend
npm install
```

## Configuración

El proyecto depende de tres variables de entorno que no se incluyen en el repositorio por motivos de seguridad. Se proporciona una plantilla en `.env.local.example` con las claves necesarias:

```
MONGODB_URI=<cadena de conexión al cluster de MongoDB Atlas>
JWT_SECRET=<secreto largo y aleatorio para firmar tokens JWT>
ADMIN_SECRET_KEY=<clave secreta para la creación controlada de administradores>
```

Hay que copiar esa plantilla a `.env.local` y completar los tres valores. La cadena de conexión se obtiene desde el panel de MongoDB Atlas. Los otros dos valores son libres, pero deben ser cadenas suficientemente largas y difíciles de adivinar.

## Arranque en desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`. El backend y el frontend se sirven desde el mismo proceso gracias a la arquitectura fullstack de Next.js.

## Creación del primer administrador

El registro público asigna siempre el rol `user` por defecto, por lo que es necesario crear manualmente el primer administrador mediante el endpoint protegido `POST /api/admin/create`. La petición requiere los datos del administrador y el valor de `ADMIN_SECRET_KEY` definido en `.env.local`:

```bash
curl -X POST http://localhost:3000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@ejemplo.com",
    "password": "contraseña_segura",
    "secretKey": "<valor de ADMIN_SECRET_KEY>"
  }'
```

Si el email ya existe como usuario estándar, el endpoint actualiza su rol a `admin` en lugar de crear una cuenta nueva.

## Estructura del proyecto

```
backend/
├── lib/
│   └── mongodb.js                # Conexión única y cacheada a MongoDB Atlas
├── middleware/
│   └── auth.js                   # protegerRuta y protegerRutaConBloqueo
├── models/
│   ├── User.js                   # Esquema de usuario con riesgo y sesiones
│   └── Partido.js                # Esquema de partido
└── src/
    ├── app/
    │   ├── api/                  # Endpoints REST (login, register, partidos, admin, stream...)
    │   ├── (auth)/               # Páginas de login y registro
    │   ├── (frontend)/           # Cartelera, vista de detalle y perfil
    │   └── (admin)/              # Panel de administración
    └── components/
        ├── HLSPlayer.js          # Reproductor HLS con heartbeat antipiratería
        ├── UserMenu.js           # Menú de sesión con avatar dinámico
        └── CarteleraCliente.js   # Cartelera con filtros (componente cliente)
```

## Sistema de detección de comportamiento anómalo

El componente central del proyecto, documentado en el apartado 4.14 de la memoria, opera desde el endpoint `POST /api/stream/acceso` mediante un modelo de puntuación de riesgo acumulativa. Cada sesión de reproducción envía un heartbeat cada 15 segundos, y el servidor evalúa eventos como sesiones simultáneas desde distintos dispositivos, accesos desde países o ciudades incompatibles, o rotación anómala de dispositivos. Cuando la puntuación supera el umbral configurado, la cuenta se bloquea automáticamente y el reproductor interrumpe la reproducción en todos los dispositivos afectados.

La constante `UMBRAL_BLOQUEO` en `src/app/api/stream/acceso/route.js` está fijada en 10 para facilitar la reproducción de las pruebas de validación del apartado 4.16 en un único equipo local. En un despliegue real debería restaurarse al valor de 50 documentado en la memoria.

## Despliegue

La arquitectura está preparada para despliegue serverless en Vercel, que detecta automáticamente los proyectos Next.js. Es suficiente con conectar el repositorio y configurar las tres variables de entorno en el panel de Vercel; no requiere configuración adicional.

## Autor

Gonzalo Montero Sierra — Grado en Ingeniería del Software, mención en Ciberseguridad.
Tutor: Bernardo Martínez Gil.
