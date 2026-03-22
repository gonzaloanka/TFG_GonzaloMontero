import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import bcrypt from 'bcryptjs';

// Endpoint para crear el primer usuario admin.
// Está protegido por una clave secreta definida en .env.local
// Solo funciona si no existe ya un admin en la base de datos.

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password, secretKey } = await request.json();

    // Verificar clave secreta
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return Response.json(
        { success: false, error: 'Clave secreta incorrecta' },
        { status: 401 }
      );
    }

    if (!name || !email || !password) {
      return Response.json(
        { success: false, error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Si el usuario ya existe, simplemente le cambiamos el rol a admin
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = 'admin';
      await existingUser.save();
      return Response.json({
        success: true,
        message: 'Usuario actualizado a admin',
        user: { id: existingUser._id, email: existingUser.email, role: existingUser.role }
      });
    }

    // Si no existe, lo creamos como admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    return Response.json({
      success: true,
      message: 'Admin creado correctamente',
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });

  } catch (error) {
    console.error('Error creando admin:', error);
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    );
  }
}