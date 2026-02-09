import mongoose from 'mongoose';

const partidoSchema = new mongoose.Schema({
  equipoLocal: { type: String, required: true },
  equipoVisitante: { type: String, required: true },
  fecha: { type: Date, required: true },
  estado: { 
    type: String, 
    enum: ['programado', 'en-directo', 'finalizado'],
    default: 'programado'
  },
  streamUrl: String,
  portada: String,   
  descripcion: String,
  autor: {           
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

export default mongoose.models.Partido || mongoose.model('Partido', partidoSchema);
