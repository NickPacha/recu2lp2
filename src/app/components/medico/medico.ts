import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from '../header/header';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medico } from '../../models/medico';
import { MedicoService } from '../../services/medico';
import { EspecialidadService } from '../../services/especialidad';
import { Especialidad } from '../../models/especialidad';

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
    especialidades: Especialidad[] = [];
    tituloModal = 'Nuevo Médico';

    form = this.fb.group({
        cmp: ['', [Validators.required, Validators.minLength(3)]],
        nombres: ['', [Validators.required, Validators.minLength(3)]],
        apellidos: ['', [Validators.required, Validators.minLength(3)]],
        idEspecialidad: [null, [Validators.required]],
    });

    @ViewChild('modal') modalRef!: ElementRef<HTMLDivElement>;
    private bsModal: any;
    editId: number | null = null;

    ngOnInit(): void {
        this.listar();
        this.listarEspecialidades();
    }

    listar() {
        this.medicoService.listar().subscribe((response) => (this.medicos = response));
    }

    listarEspecialidades() {
        this.especialidadService.listar().subscribe((data) => (this.especialidades = data));
    }

    abrirEditar(medico: Medico) {
        this.tituloModal = 'Editar Médico';
        this.editId = medico.idMedico!;
        this.form.patchValue({
            cmp: medico.cmp,
            nombres: medico.nombres,
            apellidos: medico.apellidos,
            idEspecialidad: medico.idEspecialidad ?: null
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

        const dto: Medico = {
            idMedico: this.editId || undefined,
            cmp: this.form.value.cmp!,
            nombres: this.form.value.nombres!,
            apellidos: this.form.value.apellidos!,
            idEspecialidad: this.form.value.idEspecialidad!,
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
                alert('Error al guardar el médico. Revise los datos obligatorios o duplicados.');
            },
        });
    }

    abrirNuevo() {
        this.tituloModal = 'Nuevo Médico';
        this.editId = null;
        this.form.reset({
            cmp: '',
            nombres: '',
            apellidos: '',
            idEspecialidad: null,
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
