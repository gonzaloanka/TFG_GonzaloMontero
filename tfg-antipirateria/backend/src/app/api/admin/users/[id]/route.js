import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import { protegerRuta } from '../../../../../../middleware/auth';

// PUT — cambiar rol de un usuario (solo admin)
export async function PUT(request, { params }) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  if (request.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const { role } = await request.json();

    // No se puede cambiar el rol del propio admin que hace la petición
    if (id === request.user.userId) {
      return NextResponse.json(
        { success: false, error: 'No puedes modificar tu propio rol' },
        { status: 400 }
      );
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Rol no válido' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error actualizando usuario' }, { status: 500 });
  }
}

// DELETE — eliminar usuario (solo admin)
export async function DELETE(request, { params }) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  if (request.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;

    // No se puede eliminar al propio admin que hace la petición
    if (id === request.user.userId) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar tu propia cuenta desde el panel' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error eliminando usuario' }, { status: 500 });
  }
}