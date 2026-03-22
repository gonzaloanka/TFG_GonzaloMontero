import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { protegerRuta } from '../../../../middleware/auth';

// Devuelve los datos del usuario autenticado
export async function GET(request) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  try {
    await dbConnect();
    const user = await User.findById(request.user.userId)
      .select('name email role createdAt');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error obteniendo perfil' },
      { status: 500 }
    );
  }
}

// Actualiza la contraseña del usuario autenticado
export async function PUT(request) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  try {
    await dbConnect();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const bcrypt = await import('bcryptjs');
    const user = await User.findById(request.user.userId);

    const isMatch = await bcrypt.default.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual no es correcta' },
        { status: 401 }
      );
    }

    const salt = await bcrypt.default.genSalt(10);
    user.password = await bcrypt.default.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error actualizando contraseña' },
      { status: 500 }
    );
  }
}