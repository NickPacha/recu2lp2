// src/app/models/medico.ts
import { Especialidad } from './especialidad';

export class Medico {
  idMedico?: number;
  medCmp?: string; // Cambiado a string
  medNombre?: string;
  medApellidos?: string;
  especialidad?: Especialidad;
  estado?: string;
}