import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { protegerRuta } from '../../../../../middleware/auth';

// Devuelve la lista completa de usuarios registrados.
// Solo accesible para usuarios con rol admin.

export async function GET(request) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  if (request.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const users = await User.find()
      .select('name email role isVerified createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error obteniendo usuarios' },
      { status: 500 }
    );
  }
}