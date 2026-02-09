import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Partido from '../../../../models/Partido';
import { protegerRuta } from '../../../../middleware/auth';

export async function GET() {
  try {
    await dbConnect();
    const partidos = await Partido.find()
      .populate('autor', 'name')
      .sort({ fecha: 1 })
      .limit(20);

    return NextResponse.json({ success: true, partidos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error lista partidos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const errorAuth = protegerRuta(request);
  if (errorAuth) return errorAuth;

  try {
    await dbConnect();
    const { equipoLocal, equipoVisitante, fecha, descripcion, streamUrl } = await request.json();

    const partido = await Partido.create({
      equipoLocal,
      equipoVisitante,
      fecha: new Date(fecha),
      descripcion,
      streamUrl,
      autor: request.user.userId,
    });

    const populated = await Partido.findById(partido._id).populate('autor', 'name');

    return NextResponse.json({ success: true, partido: populated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error crear partido' },
      { status: 500 }
    );
  }
}


