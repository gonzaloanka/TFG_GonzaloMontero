import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import Partido from '../../../../../../models/Partido';
import { protegerRuta } from '../../../../../../middleware/auth';

// PUT — editar un partido existente (solo admin)
export async function PUT(request, { params }) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  if (request.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Si viene fecha la convertimos a Date
    if (body.fecha) body.fecha = new Date(body.fecha);

    const partido = await Partido.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('autor', 'name');

    if (!partido) {
      return NextResponse.json({ success: false, error: 'Partido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partido });
  } catch (error) {
    console.error('Error actualizando partido:', error);
    return NextResponse.json({ success: false, error: 'Error actualizando partido' }, { status: 500 });
  }
}

// DELETE — eliminar un partido (solo admin)
export async function DELETE(request, { params }) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  if (request.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { id } = await params;

    const partido = await Partido.findByIdAndDelete(id);

    if (!partido) {
      return NextResponse.json({ success: false, error: 'Partido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando partido:', error);
    return NextResponse.json({ success: false, error: 'Error eliminando partido' }, { status: 500 });
  }
}