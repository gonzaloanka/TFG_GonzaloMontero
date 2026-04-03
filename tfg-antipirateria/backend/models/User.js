import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId:       { type: String, required: true },
  ip:              { type: String, default: 'desconocida' },
  dispositivo:     { type: String, default: 'desconocido' },
  pais:            { type: String, default: 'desconocido' },
  ciudad:          { type: String, default: 'desconocida' },
  iniciadaEn:      { type: Date, default: Date.now },
  ultimaActividad: { type: Date, default: Date.now },
}, { _id: false });

const riskEventSchema = new mongoose.Schema({
  tipo:        { type: String, required: true },
  puntos:      { type: Number, required: true },
  descripcion: { type: String, required: true },
  fecha:       { type: Date, default: Date.now },
}, { _id: false });

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
  },

  // ── Ciberseguridad: bloqueo ───────────────────────────────────────
  isBlocked:   { type: Boolean, default: false },
  blockReason: { type: String,  default: null },
  blockedAt:   { type: Date,    default: null },

  // ── Ciberseguridad: puntuación de riesgo acumulativa ─────────────
  riskScore:  { type: Number, default: 0 },
  riskEvents: { type: [riskEventSchema], default: [] },

  // ── Ciberseguridad: sesiones activas en tiempo real ───────────────
  activeSessions: { type: [sessionSchema], default: [] },

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);