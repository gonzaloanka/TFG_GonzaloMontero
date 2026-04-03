import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { protegerRuta } from '../../../../../middleware/auth';

// GET /api/admin/seguridad — cuentas bloqueadas y sesiones sospechosas
export async function GET(request) {
  const error = protegerRuta(request);
  if (error) return error;
  if (request.user.role !== 'admin') {
    return Response.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    await connectDB();

    // Cuentas bloqueadas
    const bloqueados = await User.find({ isBlocked: true })
      .select('name email role blockedAt blockReason riskScore riskEvents')
      .sort({ blockedAt: -1 })
      .lean();

    // Sesiones activas sospechosas (riskScore > 0 y no bloqueados)
    const ahora = new Date();
    const TIMEOUT = 30 * 1000;

    const conRiesgo = await User.find({
      isBlocked: false,
      riskScore: { $gt: 0 },
    })
      .select('name email riskScore riskEvents activeSessions')
      .lean();

    const sospechosos = conRiesgo
      .map(u => ({
        ...u,
        activeSessions: u.activeSessions.filter(
          s => ahora - new Date(s.ultimaActividad) < TIMEOUT
        ),
      }))
      .filter(u => u.activeSessions.length > 0);

    return Response.json({
      success: true,
      bloqueados: bloqueados.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        blockedAt: u.blockedAt,
        blockReason: u.blockReason,
        riskScore: u.riskScore,
        riskEvents: u.riskEvents?.slice(-10) || [], // últimos 10 eventos
      })),
      sospechosos: sospechosos.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        riskScore: u.riskScore,
        sesionesActivas: u.activeSessions.length,
        sesiones: u.activeSessions,
        ultimosEventos: u.riskEvents?.slice(-5) || [],
      })),
    });

  } catch (err) {
    console.error('Error en GET /api/admin/seguridad:', err);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

// POST /api/admin/seguridad — desbloquear y resetear riesgo
export async function POST(request) {
  const error = protegerRuta(request);
  if (error) return error;
  if (request.user.role !== 'admin') {
    return Response.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    await connectDB();
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
        blockReason: null,
        blockedAt: null,
        riskScore: 0,
        riskEvents: [],
        activeSessions: [],
      },
      { new: true }
    ).select('name email isBlocked riskScore');

    if (!user) {
      return Response.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: `Cuenta de ${user.name} desbloqueada y puntuación de riesgo reiniciada.`,
      user,
    });

  } catch (err) {
    console.error('Error en POST /api/admin/seguridad:', err);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}