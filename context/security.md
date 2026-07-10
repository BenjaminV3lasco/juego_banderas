# Seguridad

## Regla central

GitHub guarda codigo. PostgreSQL guarda datos. `.env` guarda secretos. Nunca mezclar esas responsabilidades.

## No subir al repo

- `.env`
- Dumps SQL
- Backups
- CSV/XLS/XLSX con datos reales
- Capturas con datos personales
- Archivos exportados desde DataGrip
- Documentos con informacion sensible

## Datos sensibles

La app puede manejar datos personales y financieros. Debe minimizar lo que guarda.

No guardar:

- CVV.
- Numeros completos de tarjetas bancarias reales.
- Passwords en texto plano.
- Backups sin cifrar dentro del proyecto.
- Tokens en `localStorage` o `sessionStorage`.

## Autenticacion

- Login individual por empleado.
- Passwords hasheadas con Argon2 o bcrypt.
- Mensajes de error que no permitan enumerar usuarios.
- Rate limiting para login y recuperacion de password.
- Sesiones con expiracion.
- Cookies `HttpOnly`, `Secure` en produccion y `SameSite` adecuado.

## Autorizacion

- Validar permisos siempre en backend.
- No confiar en checks del frontend.
- Usar roles como base inicial: `USER`, `ADMIN`, `SUPERADMIN`.
- Aplicar principio de minimo privilegio.

## Auditoria minima

Registrar:

- Usuario que hizo la accion.
- Accion realizada.
- Entidad afectada.
- Fecha y hora.
- Resultado de la operacion.
- IP y User Agent cuando aplique.

Eventos importantes:

- Login exitoso.
- Login fallido.
- Logout.
- Cambio de password.
- Cambios de roles.
- Altas, ediciones y bajas de personas, tarjetas, acuerdos y pagos.

## Produccion

- HTTPS obligatorio.
- Backups automaticos y cifrados.
- Variables de entorno configuradas en el hosting/servidor.
- Headers de seguridad.
- Acceso a base de datos restringido.
- Usuario de base con permisos minimos necesarios.
