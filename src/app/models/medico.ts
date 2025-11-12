export class Medico {
  idMedico?: number;         // ID autogenerado
  cmp?: string;              // Código de colegiatura del médico
  nombres?: string;          // Nombres del médico
  apellidos?: string;        // Apellidos del médico
  idEspecialidad?: number;   // Relación con Especialidad (FK)
}