# Yuju Frontend

Frontend web para Yuju Study Hub, una plataforma academica que consume el backend Spring Boot `proyecto-1-yuju_proy5-backendv2`.

## Funcionalidades

- Autenticacion con registro e inicio de sesion usando JWT.
- Dashboard con progreso, plan actual, recomendaciones y actividad reciente.
- Planificador semanal con prioridad, fechas, horas objetivo y estado.
- Registro de progreso: horas de estudio, metas completadas, racha y motivacion.
- Gestion de materiales academicos con tipo, categoria, precio y URL de archivo.
- Marketplace para publicar materiales, comprar o intercambiar recursos.
- Mentor IA conectado a los endpoints de recomendaciones del backend.

## Stack

- React 19
- TypeScript
- Vite
- CSS moderno sin librerias externas
- API REST Spring Boot en `http://localhost:8080/api/v1`

## Requisitos

- Node.js 22 o superior recomendado.
- Backend levantado en `http://localhost:8080`.
- PostgreSQL disponible para el backend con la base `studyhub`.

## Levantar el backend

Desde la carpeta del backend:

```bash
cd "C:\Users\Dayron Cueva\Desktop\proyecto-1-yuju_proy5-backendv2"
```

Crea un archivo `.env` basado en `.env.example`. Como minimo necesitas:

```env
SERVER_PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/studyhub
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JPA_DDL_AUTO=update
JWT_SECRET=yuju-local-dev-secret-with-more-than-32-chars
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Luego ejecuta:

```bash
.\mvnw.cmd spring-boot:run
```

### Alternativa sin PostgreSQL local

Si PostgreSQL local rechaza la clave o Docker Desktop no esta activo, puedes levantar el backend con H2 en memoria usando el classpath de test:

```cmd
set "JAVA_HOME=C:\Users\Dayron Cueva\.jdks\temurin-21.0.10"
set "Path=C:\Users\Dayron Cueva\.jdks\temurin-21.0.10\bin;%Path%"
set "JWT_SECRET=yuju-local-dev-secret-with-more-than-32-chars"
set "SPRING_DATASOURCE_URL=jdbc:h2:mem:studyhub-dev;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=false"
set "SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver"
set "SPRING_DATASOURCE_USERNAME=sa"
set "SPRING_DATASOURCE_PASSWORD="
set "SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop"
set "CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
.\mvnw.cmd -Dspring-boot.run.useTestClasspath=true -Dspring-boot.run.profiles=test spring-boot:run
```

Los datos se pierden al apagar el backend porque H2 corre en memoria.

## Levantar el frontend

Instala dependencias si aun no existen:

```bash
npm install
```

Inicia Vite:

```bash
npm run dev
```

La aplicacion abre normalmente en:

```text
http://localhost:5173
```

## Configuracion de API

Por defecto el frontend usa:

```text
http://localhost:8080/api/v1
```

Puedes cambiarlo creando un archivo `.env` en la raiz del frontend:

```env
VITE_API_URL=http://localhost:8080/api/v1
```


## Activar Gemini real

El mentor funciona de dos formas:

- Con `GEMINI_API_KEY`: el backend llama al cliente de Gemini configurado en `RecommendationService`.
- Sin `GEMINI_API_KEY`: el backend usa una respuesta local de respaldo para que la pantalla no falle durante pruebas.

Para usar Gemini real, agrega estas variables al `.env` del backend o al comando con el que lo levantas:

```env
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
```

Despues reinicia el backend. No necesitas cambiar nada en el frontend.
## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # compilacion TypeScript + build Vite
npm run preview  # previsualizar dist
npm run lint     # ejecutar oxlint
```

## Flujo recomendado de prueba

1. Levanta PostgreSQL y el backend.
2. Ejecuta `npm run dev` en este frontend.
3. Crea una cuenta desde la pantalla inicial.
4. Registra tu plan semanal y progreso.
5. Publica un material academico.
6. Crea una publicacion en el marketplace usando ese material.
7. Genera una recomendacion o pregunta al mentor IA.


## Estructura del frontend

```text
src/
  components/      Componentes reutilizables de UI.
  pages/           Vistas principales de la app web.
  services/        Cliente HTTP y servicios por dominio.
  utils/           Formateadores y helpers de vista.
  App.tsx          Orquestador de estado y navegacion interna.
  types.ts         Tipos compartidos de API y formularios.
  config.ts        Constantes iniciales y URL de API.
```

## Comportamiento local sin servicios externos

- Si Cloudinary no esta configurado en el backend, el modo local acepta URLs `http://` o `https://` para crear materiales.
- Si Gemini no esta configurado, el mentor usa modo local y devuelve una guia practica en vez de fallar.
- Si usas H2 en memoria, los usuarios, materiales y publicaciones se pierden cada vez que reinicias el backend.
## Notas

- El frontend guarda la sesion en `localStorage` bajo la clave `yuju-session`.
- Los endpoints protegidos usan `Authorization: Bearer <token>`.
- Gemini real requiere `GEMINI_API_KEY` en el backend; sin esa variable, el mentor local permite probar la interfaz.
- Esta interfaz esta pensada para web de escritorio. En pantallas pequenas conserva una anchura minima para no degradar flujos densos como dashboard, formularios y marketplace.




