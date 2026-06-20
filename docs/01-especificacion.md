# SPARC · Fase 1 — Especificación

**Proyecto:** Web Clínica Quiropráctica (Randall)
**Fecha:** 2026-06-20
**Estado:** Borrador para aprobación
**Fase SPARC:** ✅ Especificación → ⬜ Pseudocódigo → ⬜ Arquitectura → ⬜ Refinamiento → ⬜ Completado

> Este documento define **QUÉ** debe hacer el sistema y **POR QUÉ**, sin entrar en el **CÓMO** (eso es Arquitectura). Es la fuente de verdad de requisitos para las fases siguientes.

---

## 1. Visión y objetivo

Construir la presencia web de una clínica quiropráctica que cumpla dos funciones:

1. **Captar y dar confianza** a pacientes potenciales (web pública informativa).
2. **Reducir la carga de gestión de turnos** permitiendo reserva online y administración interna de la agenda.

**Métrica de éxito del MVP:** un visitante puede informarse y reservar un turno sin llamar por teléfono, y el staff puede gestionar esos turnos desde un panel sin planillas externas.

---

## 2. Alcance

### 2.1 Dentro del MVP

| # | Capacidad | Descripción |
|---|-----------|-------------|
| A | Web pública informativa | Servicios, sobre el profesional, ubicación, horarios, contacto. |
| B | Reserva de turnos online | Visitante elige servicio + franja disponible y reserva. |
| C | Panel de agenda (staff) | Quiropráctico y recepción ven, crean, editan y cancelan turnos. |
| D | Gestión de disponibilidad | Definir horarios de atención, duración de turno, bloqueos/feriados. |
| E | Notificaciones de turno | Confirmación y recordatorio al paciente (email; SMS/WhatsApp opcional, ver §9). |

### 2.2 Fuera del MVP (backlog, fases posteriores)

- **Fichas clínicas / historia clínica** (formularios clásicos). *Pospuesto: dato de salud → requiere modelo de consentimiento, RLS estricta y backup; se aborda como milestone propio.*
- **Chat-fichas con IA** (estructurar ficha por lenguaje natural).
- **Portal del paciente** (login de paciente para ver sus turnos/historia).
- **Pagos / seña online**.
- **Multi-profesional / multi-sede**.

> El alcance fuera del MVP se documenta para que las decisiones de Arquitectura no cierren puertas (ej. el modelo de datos debe poder crecer hacia fichas y portal).

---

## 3. Actores (usuarios) y roles

| Actor | Autenticado | Qué hace |
|-------|-------------|----------|
| **Visitante anónimo** | No | Navega la web pública, consulta info, **reserva un turno** dejando sus datos de contacto. |
| **Recepción / Admin** | Sí | Gestiona turnos (alta/edición/cancelación/reprogramación), gestiona disponibilidad, ve datos de contacto de pacientes. |
| **Quiropráctico / Profesional** | Sí | Todo lo de recepción + (en fases futuras) acceso a fichas clínicas. En MVP su panel ≈ recepción. |

> **No hay login de paciente en el MVP.** El paciente reserva como anónimo dejando nombre, teléfono y email. Esto simplifica el MVP y evita gestionar credenciales de paciente antes de tener portal.

> **Decisión de roles:** se modelan `admin` y `professional` como roles separados desde el día 1 aunque sus permisos coincidan en el MVP, para no migrar permisos cuando lleguen las fichas (solo el profesional las verá).

---

## 4. Requisitos funcionales (RF)

Notación: `RF-x`. Prioridad MoSCoW: **Must** / Should / Could.

### 4.1 Web pública

- **RF-01 (Must):** Mostrar página de inicio con propuesta de valor, llamada a la acción "Reservar turno".
- **RF-02 (Must):** Página/sección de servicios ofrecidos (nombre, descripción, duración estimada).
- **RF-03 (Must):** Página "Sobre el profesional" (bio, formación, foto).
- **RF-04 (Must):** Datos de contacto y ubicación (dirección, mapa, teléfono, horarios de atención).
- **RF-05 (Should):** Sección de preguntas frecuentes (FAQ).
- **RF-06 (Could):** Testimonios de pacientes.
- **RF-07 (Must):** Diseño responsive (móvil primero — la mayoría reservará desde el teléfono).

### 4.2 Reserva de turnos (visitante)

- **RF-08 (Must):** El visitante puede ver franjas horarias **disponibles** para reservar (solo libres, respetando horario de atención y turnos ya tomados).
- **RF-09 (Must):** El visitante reserva indicando: servicio, fecha/hora, nombre completo, teléfono, email, y motivo/nota opcional.
- **RF-10 (Must):** El sistema **impide doble reserva** de la misma franja (control de concurrencia).
- **RF-11 (Must):** Al reservar, el paciente recibe confirmación (en pantalla + email) con fecha, hora y dirección.
- **RF-12 (Should):** El paciente puede **cancelar** su turno mediante un enlace único del email (sin login).
- **RF-13 (Could):** El paciente puede **reprogramar** desde ese mismo enlace.
- **RF-14 (Must):** Validación de datos de contacto (email con formato válido, teléfono no vacío) en el cliente y en el servidor.

### 4.3 Panel de gestión (staff autenticado)

- **RF-15 (Must):** Login seguro para staff (email + contraseña).
- **RF-16 (Must):** Vista de agenda (día / semana) con todos los turnos.
- **RF-17 (Must):** Crear turno manualmente (ej. paciente que llamó por teléfono).
- **RF-18 (Must):** Editar, cancelar y reprogramar cualquier turno.
- **RF-19 (Must):** Marcar estado del turno: `pendiente`, `confirmado`, `atendido`, `cancelado`, `no asistió`.
- **RF-20 (Must):** Configurar disponibilidad: horarios de atención por día de la semana y duración estándar del turno.
- **RF-21 (Should):** Bloquear franjas/días (vacaciones, feriados, ausencias).
- **RF-22 (Should):** Ver y buscar pacientes por nombre/teléfono (lista derivada de las reservas).
- **RF-23 (Could):** Exportar la agenda (CSV) o sincronizar con calendario externo (iCal/Google).

### 4.4 Notificaciones

- **RF-24 (Must):** Email de confirmación inmediato al reservar.
- **RF-25 (Should):** Email recordatorio 24 h antes del turno.
- **RF-26 (Could):** Recordatorio por WhatsApp/SMS.

---

## 5. Requisitos no funcionales (RNF)

- **RNF-01 · Seguridad de datos personales:** los datos de contacto del paciente son datos personales; el panel de staff requiere autenticación y autorización por rol. Acceso a datos solo para roles staff. Preparar el terreno para datos de salud (fichas, fase 2) con aislamiento a nivel de fila.
- **RNF-02 · Privacidad / cumplimiento:** incluir aviso de privacidad y consentimiento al enviar datos en el formulario de reserva. (El detalle legal aplicable —ej. ley local de protección de datos de salud— se valida con el cliente; el sistema debe soportar borrado de datos a pedido.)
- **RNF-03 · Disponibilidad:** la web pública debe estar disponible 24/7; objetivo razonable ≥ 99 % para un negocio de este tamaño.
- **RNF-04 · Rendimiento:** carga inicial de la web pública < 2,5 s en móvil (LCP), porque impacta conversión y SEO.
- **RNF-05 · SEO y accesibilidad:** indexable por buscadores (la web es canal de captación) y conforme a WCAG 2.1 AA en lo esencial (contraste, navegación por teclado, etiquetas).
- **RNF-06 · Responsive:** funcional en móvil, tablet y escritorio.
- **RNF-07 · Mantenibilidad:** archivos < 500 líneas, validación de input en los límites del sistema (cliente + servidor), código y estructura claros (alineado con CLAUDE.md del proyecto).
- **RNF-08 · Portabilidad de despliegue:** desplegable como demo temporal en un PaaS (Vercel) y migrable al hosting propio del cliente o a Coolify (self-host) sin reescritura. Ver §6.
- **RNF-09 · Idioma:** interfaz en español.
- **RNF-10 · Zona horaria:** toda la lógica de turnos opera en la zona horaria local de la clínica; almacenar en UTC, mostrar en local.

---

## 6. Recomendación de stack y despliegue

> Recomendación pedida por el cliente. Decisión **propuesta**, se cierra formalmente en la fase de Arquitectura. Contexto: ya hay hosting propio; se quiere demo temporal en Vercel o Coolify.

**Propuesta: Next.js (App Router) + Supabase + Vercel (demo) → portable a Coolify/hosting propio.**

| Necesidad del proyecto | Por qué este stack la cubre |
|------------------------|------------------------------|
| Web pública con buen SEO y carga rápida | Next.js hace render en servidor / estático → bueno para SEO (RNF-05) y LCP (RNF-04). |
| Reserva + panel en una sola base de código | Next sirve la web pública **y** el panel staff; un solo proyecto. |
| Auth con roles para staff | Supabase Auth + Postgres con Row Level Security cubre login y permisos por rol (RNF-01). |
| Crecer hacia fichas/portal sin reescribir | Postgres relacional + RLS escala a datos de salud y portal de paciente (alcance §2.2). |
| Demo temporal rápida y gratis | Vercel despliega Next con cero config (RNF-08). |
| No quedar atado al PaaS | Next + Supabase son self-hostables; **Coolify** puede correr ambos en el hosting propio del cliente → migración sin reescribir (RNF-08). |
| Notificaciones email | Servicio transaccional (ej. Resend) integra simple desde funciones de Next. |

**Alternativa más simple** si el cliente quisiera mínimo costo y la agenda fuera muy básica: sitio estático (Astro) + un servicio de reservas embebido. **Descartada como base** porque el panel de staff con roles y la lógica de disponibilidad propia (RF-15–RF-23) piden backend y base de datos propios; empezar estático obligaría a reescribir al crecer.

> **Ruta de despliegue propuesta:** (1) demo en Vercel + Supabase gratuito para validar con el cliente → (2) producción en hosting propio vía Coolify (Next + Postgres + Supabase self-host) o Vercel de pago, según preferencia del cliente.

---

## 7. Modelo de dominio (conceptual)

Entidades y relaciones, sin esquema de BD (eso es Arquitectura):

- **Servicio** — { nombre, descripción, duración }. Lo que se puede reservar.
- **Turno (Appointment)** — { fecha-hora inicio, fin, servicio, estado, nota }. Pertenece a un Paciente; ocupa una franja.
- **Paciente (contacto)** — { nombre, teléfono, email }. En el MVP **no** es un usuario con login; es el contacto dueño de turnos.
- **Disponibilidad** — { día de semana, hora desde, hora hasta, duración de turno } + **Bloqueos** { fecha/rango, motivo }.
- **Usuario staff** — { email, rol ∈ (admin, professional) }. Autenticado.

Reglas de dominio clave:
- Un Turno solo puede crearse sobre una franja libre dentro de la disponibilidad y fuera de bloqueos (RF-08, RF-10).
- Estados del turno siguen un ciclo: `pendiente → confirmado → atendido` | `cancelado` | `no asistió` (RF-19).

---

## 8. Recorridos de usuario (user flows)

**8.1 Visitante reserva un turno (camino feliz)**
1. Entra a la web → clic "Reservar turno".
2. Elige servicio → ve franjas libres → elige fecha/hora.
3. Completa nombre, teléfono, email, (nota), acepta aviso de privacidad.
4. Confirma → ve confirmación en pantalla + recibe email (RF-11, RF-24).

**8.2 Recepción gestiona la agenda**
1. Login (RF-15) → ve agenda de la semana (RF-16).
2. Crea turno telefónico / reprograma / cancela (RF-17, RF-18).
3. Marca "atendido" o "no asistió" tras la sesión (RF-19).

**8.3 Paciente cancela**
1. Abre enlace único del email → confirma cancelación → la franja vuelve a estar libre (RF-12).

---

## 9. Supuestos y preguntas abiertas

> A resolver antes de Arquitectura/Refinamiento. Se asume un valor por defecto razonable salvo indicación.

| # | Tema | Supuesto por defecto | Necesita confirmación del cliente |
|---|------|----------------------|-----------------------------------|
| S-1 | Profesionales | **Uno solo** (single-provider) en MVP. | ¿Habrá más de un quiropráctico que comparta agenda? |
| S-2 | Duración de turno | Única y configurable (ej. 30 min). | ¿Distintas duraciones según servicio? |
| S-3 | Canal de notificación | **Email** en MVP. | ¿WhatsApp/SMS desde ya, o más adelante? |
| S-4 | Pagos | **Sin pago/seña** online en MVP. | ¿Cobrar seña al reservar en el futuro? |
| S-5 | Anticipación / política | Reserva con X horas mínimas de anticipación; cancelación libre. | Definir ventana de anticipación y política de cancelación. |
| S-6 | Datos legales | Aviso de privacidad genérico + opción de borrado. | Confirmar normativa local de datos de salud aplicable. |
| S-7 | Contenido | Textos, fotos, bio, servicios reales. | El cliente debe proveer el contenido (copy + imágenes). |
| S-8 | Marca | Sin identidad visual definida aún. | ¿Logo, colores, tipografía existentes? |

---

## 10. Criterios de aceptación del MVP (Definition of Done)

El MVP está **listo** cuando:

1. ✅ Un visitante en móvil puede reservar un turno en una franja libre y recibe email de confirmación.
2. ✅ El sistema impide reservar una franja ya ocupada.
3. ✅ El staff inicia sesión y ve/crea/edita/cancela turnos en una vista de agenda.
4. ✅ El staff configura horarios de atención y bloquea fechas.
5. ✅ La web pública muestra servicios, profesional, contacto y ubicación, es responsive y carga rápido en móvil.
6. ✅ Los datos de contacto solo son accesibles tras autenticación de staff.
7. ✅ La demo está desplegada en una URL pública (Vercel) para revisión del cliente.

---

## 11. Próxima fase

**Pseudocódigo** — diseñar la lógica de los algoritmos no triviales antes de codear:
- Cálculo de franjas disponibles (disponibilidad − turnos ocupados − bloqueos).
- Control de concurrencia en la reserva (evitar doble booking).
- Máquina de estados del turno.
- Lógica de notificaciones (confirmación + recordatorio 24 h).

> Aprobá esta especificación (o marcá qué ajustar en §9) y avanzo a Pseudocódigo.
