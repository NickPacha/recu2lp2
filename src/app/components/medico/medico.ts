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

  medicos: Medico[] = []; // Lista completa de médicos
  pagedMedicos: Medico[] = []; // Lista de médicos para la página actual
  especialidades: Especialidad[] = []; // Lista para el select
  tituloModal = 'Nuevo Médico';
  editId: number | null = null;

  // Propiedades para la paginación
  pageSize: number = 10; // Número de elementos por página (ajusta según necesidad)
  currentPage: number = 1; // Página actual (inicia en 1)
  totalPages: number = 0; // Total de páginas (se calculará dinámicamente)

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
    this.medicoService.listar().subscribe(response => {
      this.medicos = response;
      this.calculatePagination(); // Calcula la paginación después de cargar los datos
    });
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
      this.medicoService.eliminar(id).subscribe(() => {
        this.listar(); // Recarga la lista completa
        // Opcional: Mantener la página actual si el médico eliminado no estaba en la última página
        // Si se eliminó el último elemento de la última página, ir a la anterior
        // if (this.medicos.length > 0 && this.currentPage > this.totalPages) {
        //   this.currentPage = Math.max(1, this.currentPage - 1);
        //   this.calculatePagination();
        // }
      });
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
        this.listar(); // Recarga la lista completa
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

  /**
   * Calcula el total de páginas y obtiene los médicos para la página actual.
   */
  private calculatePagination(): void {
    if (this.medicos && this.medicos.length > 0) {
      this.totalPages = Math.ceil(this.medicos.length / this.pageSize);
      // Asegura que currentPage no exceda totalPages y sea al menos 1
      this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.pagedMedicos = this.medicos.slice(startIndex, endIndex);
    } else {
      this.totalPages = 0;
      this.currentPage = 1;
      this.pagedMedicos = [];
    }
  }

  /**
   * Cambia a una página específica.
   * @param page Número de página objetivo (1-indexed).
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination(); // Actualiza los datos mostrados
    }
  }

  /**
   * Navega a la página anterior.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculatePagination();
    }
  }

  /**
   * Navega a la página siguiente.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculatePagination();
    }
  }

  /**
   * Genera un array con los números de página para el HTML.
   * @returns Array de números de página.
   */
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}