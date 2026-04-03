import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { protegerRutaConBloqueo } from '../../../../../middleware/auth';

const TIMEOUT_SESION_MS = 30 * 1000; // 30s sin heartbeat = sesión expirada
const UMBRAL_BLOQUEO = 10;           // puntos para bloqueo automático
const DEDUP_MS = 5 * 60 * 1000;     // mismo evento no se repite en 5 minutos

async function geolocalizarIP(ip) {
  try {
    if (!ip || ip === 'desconocida' || ip.startsWith('127.') || ip.startsWith('::1') || ip === '::ffff:127.0.0.1') {
      return { pais: 'Local', ciudad: 'Localhost' };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(2000)
    });
    const data = await res.json();
    if (data.status === 'success') {
      return { pais: data.country || 'desconocido', ciudad: data.city || 'desconocida' };
    }
  } catch {}
  return { pais: 'desconocido', ciudad: 'desconocida' };
}

function evaluarRiesgo(sesionesActivas, geoActual, user) {
  const eventos = [];
  const ahora = new Date();
  const riskEvents = user.riskEvents || [];
  const activeSessions = user.activeSessions || [];

  // 1. Sesiones simultáneas
  const otrasActivas = sesionesActivas.filter(s => s.sessionId !== geoActual.sessionId);
  if (otrasActivas.length >= 2) {
    eventos.push({
      tipo: 'SESIONES_SIMULTANEAS_MULTIPLES',
      puntos: 25,
      descripcion: `${otrasActivas.length + 1} sesiones simultáneas activas desde distintos dispositivos.`,
    });
  } else if (otrasActivas.length === 1) {
    eventos.push({
      tipo: 'SESIONES_SIMULTANEAS',
      puntos: 10,
      descripcion: `2 sesiones simultáneas activas desde distintos dispositivos.`,
    });
  }

  // 2. País diferente al habitual
  const paisActual = geoActual.pais;
  if (paisActual && paisActual !== 'desconocido' && paisActual !== 'Local') {
    const paisesConocidos = activeSessions
      .map(s => s.pais)
      .filter(p => p && p !== 'desconocido' && p !== 'Local');
    if (paisesConocidos.length > 0) {
      const paisMasComun = paisesConocidos.sort((a, b) =>
        paisesConocidos.filter(v => v === b).length - paisesConocidos.filter(v => v === a).length
      )[0];
      if (paisActual !== paisMasComun && otrasActivas.some(s => s.pais === paisMasComun)) {
        eventos.push({
          tipo: 'PAIS_DIFERENTE',
          puntos: 20,
          descripcion: `Sesión simultánea desde ${paisActual} cuando la cuenta opera habitualmente desde ${paisMasComun}.`,
        });
      }
    }
  }

  // 3. Ciudad diferente en menos de 1 hora
  const unaHoraAtras = new Date(ahora - 60 * 60 * 1000);
  const ciudadActual = geoActual.ciudad;
  if (ciudadActual && ciudadActual !== 'desconocida' && ciudadActual !== 'Localhost') {
    const sesionOtraCiudad = otrasActivas.find(s =>
      s.ciudad && s.ciudad !== 'desconocida' && s.ciudad !== ciudadActual &&
      new Date(s.iniciadaEn) > unaHoraAtras
    );
    if (sesionOtraCiudad) {
      eventos.push({
        tipo: 'CIUDAD_DIFERENTE_RAPIDO',
        puntos: 15,
        descripcion: `Sesión desde ${ciudadActual} mientras otra sesión activa en ${sesionOtraCiudad.ciudad} comenzó hace menos de 1 hora.`,
      });
    }
  }

  // 4. Más de 4 dispositivos distintos en 24h
  const unDiaAtras = new Date(ahora - 24 * 60 * 60 * 1000);
  const sessionIdsUnicos24h = new Set([
    ...sesionesActivas.map(s => s.sessionId),
    ...riskEvents
      .filter(e => new Date(e.fecha) > unDiaAtras && e.tipo === 'SESIONES_SIMULTANEAS')
      .map((_, i) => `hist_${i}`)
  ]);
  if (sessionIdsUnicos24h.size > 4) {
    eventos.push({
      tipo: 'MUCHOS_DISPOSITIVOS_24H',
      puntos: 15,
      descripcion: `Más de 4 dispositivos distintos han accedido a esta cuenta en las últimas 24 horas.`,
    });
  }

  // 5. Más de 7 dispositivos distintos en 7 días
  const sieteDiasAtras = new Date(ahora - 7 * 24 * 60 * 60 * 1000);
  const sessionIds7dias = new Set(
    activeSessions
      .filter(s => new Date(s.iniciadaEn) > sieteDiasAtras)
      .map(s => s.sessionId)
  );
  if (sessionIds7dias.size > 7) {
    eventos.push({
      tipo: 'MUCHOS_DISPOSITIVOS_7DIAS',
      puntos: 25,
      descripcion: `Más de 7 dispositivos distintos han accedido a esta cuenta en los últimos 7 días.`,
    });
  }

  return eventos;
}

export async function POST(request) {
  const errorAuth = await protegerRutaConBloqueo(request);
  if (errorAuth) return errorAuth;

  try {
    await connectDB();

    const { sessionId } = await request.json();
    if (!sessionId) {
      return Response.json({ success: false, error: 'sessionId requerido' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'desconocida';
    const ua = request.headers.get('user-agent') || 'desconocido';
    const dispositivo = ua.length > 120 ? ua.substring(0, 120) : ua;
    const ahora = new Date();

    const user = await User.findById(request.user.userId);
    if (!user) {
      return Response.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Inicializar campos si no existen (usuarios creados antes del nuevo modelo)
    if (!user.activeSessions) user.activeSessions = [];
    if (!user.riskEvents) user.riskEvents = [];
    if (user.riskScore === undefined || user.riskScore === null) user.riskScore = 0;

    // 1. Limpiar sesiones expiradas
    user.activeSessions = user.activeSessions.filter(s =>
      ahora - new Date(s.ultimaActividad) < TIMEOUT_SESION_MS
    );

    // 2. Geolocalizar IP
    const geo = await geolocalizarIP(ip);

    // 3. Actualizar o añadir sesión actual
    const sesionExistente = user.activeSessions.find(s => s.sessionId === sessionId);
    if (sesionExistente) {
      sesionExistente.ultimaActividad = ahora;
      sesionExistente.ip = ip;
      sesionExistente.pais = geo.pais;
      sesionExistente.ciudad = geo.ciudad;
    } else {
      user.activeSessions.push({
        sessionId, ip, dispositivo,
        pais: geo.pais, ciudad: geo.ciudad,
        iniciadaEn: ahora, ultimaActividad: ahora,
      });
    }

    // 4. Evaluar riesgo — deduplicar: mismo tipo de evento no suma puntos
    //    más de una vez en los últimos 5 minutos
    const cincoMinutosAtras = new Date(ahora - DEDUP_MS);
    const tiposRecientes = new Set(
      user.riskEvents
        .filter(e => new Date(e.fecha) > cincoMinutosAtras)
        .map(e => e.tipo)
    );

    const eventosNuevos = evaluarRiesgo(
      user.activeSessions,
      { sessionId, pais: geo.pais, ciudad: geo.ciudad },
      user
    ).filter(e => !tiposRecientes.has(e.tipo));

    // 5. Acumular puntos
    if (eventosNuevos.length > 0) {
      const puntosNuevos = eventosNuevos.reduce((sum, e) => sum + e.puntos, 0);
      user.riskScore = (user.riskScore || 0) + puntosNuevos;
      user.riskEvents.push(...eventosNuevos.map(e => ({ ...e, fecha: ahora })));

      // 6. Bloqueo automático si supera el umbral
      if (user.riskScore >= UMBRAL_BLOQUEO) {
        const resumen = user.riskEvents
          .slice(-5)
          .map(e => `• ${e.descripcion} (+${e.puntos} pts)`)
          .join('\n');

        user.isBlocked = true;
        user.blockReason = `Cuenta bloqueada automáticamente por comportamiento anómalo acumulado (${user.riskScore} puntos).\n\nÚltimos eventos detectados:\n${resumen}`;
        user.blockedAt = ahora;
        user.activeSessions = [];
        await user.save();

        return Response.json({
          success: false,
          error: 'Cuenta bloqueada',
          motivo: user.blockReason,
          riskScore: user.riskScore,
          blocked: true,
        }, { status: 403 });
      }
    }

    await user.save();

    return Response.json({
      success: true,
      riskScore: user.riskScore,
      sesionesActivas: user.activeSessions.length,
    });

  } catch (err) {
    console.error('Error en /api/stream/acceso:', err);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}