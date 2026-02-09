import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nombre obligatorio'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email obligatorio'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Contraseña obligatoria'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', userSchema);
