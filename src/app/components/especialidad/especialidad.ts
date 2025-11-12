import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from '../header/header';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  @ViewChild('modal') modalRef!: ElementRef<HTMLDivElement>;
  private bsModal: any;
  editId: number | null = null;

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.especialidadService.listar().subscribe((response) => (this.especialidades = response));
  }

  abrirEditar(especialidad: Especialidad) {
    this.tituloModal = 'Editar Especialidad';
    this.editId = especialidad.idEspecialidad!;
    this.form.patchValue({
      nombre: especialidad.nombre,
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

    const dto: Especialidad = {
      idEspecialidad: this.editId || undefined,
      nombre: this.form.value.nombre!,
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
        alert('Error al guardar la especialidad. Revise los datos.');
      },
    });
  }

  abrirNuevo() {
    this.tituloModal = 'Nueva Especialidad';
    this.editId = null;
    this.form.reset({ nombre: '' });
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
