import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'tfg_dev_secret_change_later';

export function protegerRuta(req) {  // ← NOMBRE ESPAÑOL
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
