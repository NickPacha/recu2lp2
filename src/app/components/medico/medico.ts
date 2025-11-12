// src/app/components/medico/medico.ts
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from '../header/header';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Medico } from '../../models/medico';
import { Especialidad } from '../../models/especialidad';
import { MedicoService } from '../../services/medico';
import { EspecialidadService } from '../../services/especialidad';

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [Header, CommonModule, ReactiveFormsModule],
  templateUrl: './medico.html',
  styleUrls: ['./medico.css'],
})
export class MedicoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);

  medicos: Medico[] = [];
  especialidades: Especialidad[] = []; // Lista para el select
  tituloModal = 'Nuevo Médico';
  editId: number | null = null;

  // ✅ Inicializa idEspecialidad como "null as number | null", similar a SancionComponent
  form = this.fb.group({
    medNombre: ['', [Validators.required, Validators.minLength(3)]],
    medApellidos: ['', [Validators.required, Validators.minLength(3)]],
    medCmp: ['', [Validators.required, Validators.minLength(1)]], // Cambiado a string
    idEspecialidad: [null as number | null, [Validators.required]], // Clave foránea como número o null
    estado: ['ACTIVO', [Validators.required]],
  });

  @ViewChild('modal') modalRef!: ElementRef<HTMLDivElement>;
  private bsModal: any;

  ngOnInit(): void {
    this.listar();
    this.listarEspecialidades(); // Cargar especialidades para el formulario
  }

  listar() {
    this.medicoService.listar().subscribe(response => (this.medicos = response));
  }

  listarEspecialidades() {
    this.especialidadService.listar().subscribe(response => (this.especialidades = response));
  }

  abrirEditar(medico: Medico) {
    this.tituloModal = 'Editar Médico';
    this.editId = medico.idMedico!;
    this.form.patchValue({
      medNombre: medico.medNombre ?? '',
      medApellidos: medico.medApellidos ?? '',
      medCmp: medico.medCmp ?? '', // Asignar string
      // ✅ Asignar idEspecialidad directamente, ya que viene como number o undefined del backend
      idEspecialidad: medico.especialidad?.id ?? null, // Esto debería funcionar ahora
      estado: medico.estado ?? 'ACTIVO',
    });
    this.showModal();
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar médico?')) {
      this.medicoService.eliminar(id).subscribe(() => this.listar());
    }
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.value;
    // Buscar la especialidad seleccionada para incluir en el DTO si es necesario
    const especialidadSeleccionada = this.especialidades.find(e => e.id === v.idEspecialidad);

    const dto: Medico = {
      idMedico: this.editId ?? undefined,
      medCmp: v.medCmp!, // Asignar string
      medNombre: v.medNombre!,
      medApellidos: v.medApellidos!,
      // Opción 1: Enviar solo el ID de la especialidad al backend (recomendado si el backend lo maneja bien)
      especialidad: especialidadSeleccionada || undefined,
      // Opción 2: Si el backend espera solo el ID en el objeto, podrías hacer:
      // especialidad: v.idEspecialidad ? { id: v.idEspecialidad } as Especialidad : undefined,
      estado: v.estado!,
    };

    const obs = this.editId
      ? this.medicoService.actualizar(this.editId, dto)
      : this.medicoService.crear(dto);

    obs.subscribe({
      next: () => {
        this.hideModal();
        this.listar();
      },
      error: (err) => {
        console.error('Error al guardar médico:', err);
        alert('Error al guardar el médico. Revise los datos (CMP).');
      },
    });
  }

  abrirNuevo() {
    this.tituloModal = 'Nuevo Médico';
    this.editId = null;
    this.form.reset({
      medNombre: '',
      medApellidos: '',
      medCmp: '', // Reiniciar a string vacío
      idEspecialidad: null, // Reiniciar a null
      estado: 'ACTIVO',
    });
    this.showModal();
  }

  private showModal() {
    const m = this.modalRef.nativeElement;
    // @ts-ignore
    this.bsModal = new bootstrap.Modal(m);
    this.bsModal.show();
  }

  private hideModal() {
    if (this.bsModal) {
      this.bsModal.hide();
    }
  }
}