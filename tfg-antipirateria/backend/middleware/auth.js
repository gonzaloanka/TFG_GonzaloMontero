import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from '../lib/mongodb';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'tfg_dev_secret_change_later';

export function protegerRuta(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Token requerido' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return null;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    );
  }
}

// Versión async que además comprueba si la cuenta está bloqueada.
// Usar en endpoints sensibles como el acceso al stream.
export async function protegerRutaConBloqueo(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Token requerido' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Comprobar bloqueo en base de datos
    await connectDB();
    const user = await User.findById(decoded.userId).select('isBlocked blockReason');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cuenta bloqueada',
          motivo: user.blockReason || 'Acceso simultáneo detectado desde múltiples dispositivos.',
          blocked: true,
        },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    );
  }
}