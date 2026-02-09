import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return Response.json(
        { success: false, error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: 'Contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { success: false, error: 'Email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return Response.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Error en /api/register:', error);
    
    // Capturar error de email duplicado
    if (error.code === 11000) {
      return Response.json(
        { success: false, error: 'Email ya está registrado' },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, error: 'Error interno de servidor' },
      { status: 500 }
    );
  }
}
