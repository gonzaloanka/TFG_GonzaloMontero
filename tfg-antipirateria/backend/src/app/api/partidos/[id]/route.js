import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Partido from '../../../../../models/Partido';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const partido = await Partido.findById(id)
      .populate('autor', 'name');

    if (!partido) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, partido });
  } catch (error) {
    console.error('Error detalle:', error);
    return NextResponse.json(
      { success: false, error: 'Error detalle partido' },
      { status: 500 }
    );
  }
}
