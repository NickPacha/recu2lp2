// src/app/components/especialidad/especialidad.ts
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from '../header/header';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../../models/especialidad';
import { EspecialidadService } from '../../services/especialidad';

@Component({
  selector: 'app-especialidad',
  standalone: true,
  imports: [Header, CommonModule, ReactiveFormsModule],
  templateUrl: './especialidad.html',
  styleUrls: ['./especialidad.css'],
})
export class EspecialidadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private especialidadService = inject(EspecialidadService);

  especialidades: Especialidad[] = [];
  tituloModal = 'Nueva Especialidad';
  editId: number | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    estado: ['ACTIVO', [Validators.required]],
  });

  @ViewChild('modal') modalRef!: ElementRef<HTMLDivElement>;
  private bsModal: any;

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.especialidadService.listar().subscribe(response => (this.especialidades = response));
  }

  abrirEditar(esp: Especialidad) {
    this.tituloModal = 'Editar Especialidad';
    this.editId = esp.id!;
    this.form.patchValue({
      nombre: esp.nombre ?? '',
      estado: esp.estado ?? 'ACTIVO',
    });
    this.showModal();
  }

  eliminar(id: number) {
    if (confirm('¿Eliminar especialidad?')) {
      this.especialidadService.eliminar(id).subscribe(() => this.listar());
    }
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.value;
    const dto: Especialidad = {
      id: this.editId ?? undefined,
      nombre: v.nombre!,
      estado: v.estado!,
    };

    const obs = this.editId
      ? this.especialidadService.actualizar(this.editId, dto)
      : this.especialidadService.crear(dto);

    obs.subscribe({
      next: () => {
        this.hideModal();
        this.listar();
      },
      error: (err) => {
        console.error('Error al guardar especialidad:', err);
        alert('Error al guardar la especialidad. Revise los datos únicos (Nombre).');
      },
    });
  }

  abrirNuevo() {
    this.tituloModal = 'Nueva Especialidad';
    this.editId = null;
    this.form.reset({
      nombre: '',
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